import { PRODUCTS, trendFor } from '@/data/products';
import type {
  LeaderboardResponse,
  ProductStatsResponse,
  Source,
} from '@/features/leaderboard/types';

/**
 * API layer. By default runs in MOCK mode so the app demos standalone on a
 * simulator with no backend, no Postgres, no Redis. Set EXPO_PUBLIC_API_URL to
 * point at the real Node/Express backend in `backend/` to hit live PG + Redis.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const USE_MOCK = API_URL.length === 0;

// Simulated latencies that mirror the measured backend numbers:
//   cold PostgreSQL aggregation over ~50k rows -> ~280ms
//   warm Redis hit (pre-serialized JSON)        -> single-digit ms
const DB_LATENCY_MS = 280;
const CACHE_LATENCY_MS = 6;
const TTL_SECONDS = 60;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// In-memory mock of the Redis key state: which keys are currently "warm".
const warmKeys = new Set<string>();
let cachedAt = 0;

function keyFor(limit: number) {
  return `leaderboard:v1:all:${limit}`;
}

function now(): number {
  return Date.now();
}

function jitter(base: number): number {
  // +/- 12% so the latency badge looks alive, not hard-coded.
  const span = base * 0.12;
  return Math.round(base - span + Math.random() * span * 2);
}

interface FetchResult<T> {
  data: T;
  source: Source;
  serverMs: number;
}

async function mockLeaderboard(limit: number): Promise<FetchResult<typeof PRODUCTS>> {
  const key = keyFor(limit);
  const ttlExpired = now() - cachedAt > TTL_SECONDS * 1000;
  const hit = warmKeys.has(key) && !ttlExpired;
  const serverMs = jitter(hit ? CACHE_LATENCY_MS : DB_LATENCY_MS);
  await sleep(serverMs);
  if (!hit) {
    warmKeys.add(key);
    cachedAt = now();
  }
  return { data: PRODUCTS.slice(0, limit), source: hit ? 'cache' : 'db', serverMs };
}

export function invalidateMockCache() {
  warmKeys.clear();
  cachedAt = 0;
}

function ttlRemaining(): number {
  if (cachedAt === 0) return 0;
  return Math.max(0, TTL_SECONDS - Math.round((now() - cachedAt) / 1000));
}

export async function getLeaderboard(limit: number): Promise<LeaderboardResponse> {
  const t0 = now();
  if (USE_MOCK) {
    const { data, source, serverMs } = await mockLeaderboard(limit);
    return {
      items: data,
      meta: {
        source,
        serverMs,
        clientMs: now() - t0,
        servedAt: new Date().toISOString(),
        ttlRemaining: ttlRemaining(),
      },
    };
  }
  const res = await fetch(`${API_URL}/api/leaderboard?limit=${limit}&category=all`);
  const body = await res.json();
  return {
    items: body.items,
    meta: {
      source: body.source,
      serverMs: body.elapsedMs,
      clientMs: now() - t0,
      servedAt: body.generatedAt,
      ttlRemaining: body.ttlRemaining ?? 0,
    },
  };
}

export async function forceRefresh(limit: number): Promise<LeaderboardResponse> {
  if (USE_MOCK) {
    invalidateMockCache();
    return getLeaderboard(limit);
  }
  await fetch(`${API_URL}/api/leaderboard/refresh`, { method: 'POST' });
  return getLeaderboard(limit);
}

export async function getProductStats(productId: number): Promise<ProductStatsResponse> {
  const t0 = now();
  const found = PRODUCTS.find((p) => p.productId === productId) ?? PRODUCTS[0];
  if (USE_MOCK) {
    const key = `product:stats:${productId}`;
    const hit = warmKeys.has(key);
    const serverMs = jitter(hit ? CACHE_LATENCY_MS : DB_LATENCY_MS / 2);
    await sleep(serverMs);
    warmKeys.add(key);
    return {
      product: { ...found, trend: trendFor(productId) },
      meta: {
        source: hit ? 'cache' : 'db',
        serverMs,
        clientMs: now() - t0,
        servedAt: new Date().toISOString(),
        ttlRemaining: TTL_SECONDS,
      },
    };
  }
  const res = await fetch(`${API_URL}/api/products/${productId}/stats`);
  const body = await res.json();
  return {
    product: { ...body.item, trend: body.trend ?? [] },
    meta: {
      source: body.source,
      serverMs: body.elapsedMs,
      clientMs: now() - t0,
      servedAt: body.generatedAt,
      ttlRemaining: body.ttlRemaining ?? 0,
    },
  };
}

export const config = { USE_MOCK, API_URL, TTL_SECONDS, DB_LATENCY_MS, CACHE_LATENCY_MS };
