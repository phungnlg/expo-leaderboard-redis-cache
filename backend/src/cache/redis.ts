import Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis(config.redisUrl, { lazyConnect: false });

redis.on('error', (e) => console.error('[redis] error', e.message));

/**
 * Prefix invalidation using SCAN + UNLINK (never KEYS, never blocking DEL).
 * UNLINK frees memory asynchronously so it stays non-blocking under load.
 */
export async function invalidatePattern(pattern: string): Promise<number> {
  let cursor = '0';
  let removed = 0;
  do {
    const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = next;
    if (keys.length) {
      await redis.unlink(...keys);
      removed += keys.length;
    }
  } while (cursor !== '0');
  return removed;
}
