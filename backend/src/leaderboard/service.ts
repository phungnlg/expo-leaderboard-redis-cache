import { redis, invalidatePattern } from '../cache/redis';
import { config } from '../config';
import { aggregateLeaderboard, type Row } from './repository';

const VERSION = 'v1';

function cacheKey(category: string, limit: number): string {
  return `leaderboard:${VERSION}:${category}:${limit}`;
}

export interface LeaderboardResult {
  source: 'cache' | 'db';
  items: (Row & { rank: number })[];
  generatedAt: string;
  count: number;
  ttlRemaining: number;
}

/**
 * Cache-aside (lazy loading). Read-heavy + expensive aggregation, so we compute
 * on read and cache, rather than recompute on every write. TTL is the
 * self-healing safety net; explicit invalidation on writes is the correctness
 * mechanism. All Redis calls are wrapped so an outage degrades to source:'db'.
 */
export async function getLeaderboard(category: string, limit: number): Promise<LeaderboardResult> {
  const key = cacheKey(category, limit);

  try {
    const cached = await redis.get(key);
    if (cached) {
      const ttl = await redis.ttl(key);
      return { ...(JSON.parse(cached) as Omit<LeaderboardResult, 'source' | 'ttlRemaining'>), source: 'cache', ttlRemaining: Math.max(0, ttl) };
    }
  } catch (e) {
    console.error('[cache] read failed, falling back to db', (e as Error).message);
  }

  const rows = await aggregateLeaderboard(limit);
  const items = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  const payload = { items, generatedAt: new Date().toISOString(), count: items.length };

  try {
    // store already-serialized JSON so a HIT skips both query AND re-serialization
    await redis.set(key, JSON.stringify(payload), 'EX', config.cacheTtlSeconds);
  } catch (e) {
    console.error('[cache] write failed', (e as Error).message);
  }

  return { ...payload, source: 'db', ttlRemaining: config.cacheTtlSeconds };
}

export async function invalidateLeaderboard(): Promise<number> {
  return invalidatePattern(`leaderboard:${VERSION}:*`);
}
