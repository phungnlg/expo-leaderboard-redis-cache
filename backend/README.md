# Backend - Node.js + TypeScript + PostgreSQL + Redis

The API behind the leaderboard demo. A read-heavy, expensive aggregation
(`JOIN products + orders + reviews`, `GROUP BY`, `ORDER BY revenue`) fronted by
a **cache-aside** Redis layer.

## Run

```bash
docker compose up -d        # Postgres + Redis
cp .env.example .env
npm install
npm run seed                # schema + ~50k orders so the GROUP BY is genuinely slow
npm run dev                 # API on :4000
```

Point the mobile app at it: set `EXPO_PUBLIC_API_URL=http://localhost:4000` in
the app root, otherwise the app runs on built-in mock data.

## Endpoints

| Method | Path | What |
| --- | --- | --- |
| GET | `/api/leaderboard?limit=20&category=all` | cached read (the demoed path) |
| POST | `/api/leaderboard/refresh` | `DEL` keys then recompute, always `source:db` |
| POST | `/api/products/:id/orders` | write that invalidates the cache |
| GET | `/api/health` | reports Postgres + Redis connectivity |

Every read returns `{ source: "cache" | "db", elapsedMs, generatedAt, ttlRemaining, items }`.

## Caching strategy

- **Pattern**: cache-aside (lazy). Compute on read, cache, serve from cache.
- **Key**: `leaderboard:v1:{category}:{limit}` - versioned prefix lets a shape
  change invalidate the whole namespace by bumping `v1`.
- **TTL**: 60s, self-healing safety net. Stores already-serialized JSON so a HIT
  skips the query *and* re-serialization.
- **Invalidation**: `SCAN MATCH + UNLINK` (never `KEYS`, never blocking `DEL`)
  on every write and on `/refresh`.
- **Resilience**: all Redis calls are wrapped; an outage degrades to
  `source:'db'` instead of erroring.

## Flow

```
controller (validate + time)
  -> service.getLeaderboard
       -> redis GET key
            HIT  -> parse + return  (single-digit ms)
            MISS -> aggregate in Postgres -> SET key EX 60 -> return (~280ms)
  -> attach source + elapsedMs -> JSON
```
