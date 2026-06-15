import express from 'express';
import { performance } from 'node:perf_hooks';
import { config } from './config';
import { pool } from './db/pool';
import { redis } from './cache/redis';
import { getLeaderboardHandler, refreshHandler } from './leaderboard/controller';

const app = express();
app.use(express.json());

app.get('/api/leaderboard', getLeaderboardHandler);
app.post('/api/leaderboard/refresh', refreshHandler);

// write that invalidates the cache - proves write-side invalidation, not just TTL
app.post('/api/products/:id/orders', async (req, res) => {
  const productId = Number(req.params.id);
  const { qty = 1, amount = 0 } = req.body ?? {};
  try {
    const { rows } = await pool.query(
      'INSERT INTO orders(product_id, qty, amount) VALUES ($1,$2,$3) RETURNING id',
      [productId, qty, amount],
    );
    const { invalidateLeaderboard } = await import('./leaderboard/service');
    await invalidateLeaderboard();
    res.status(201).json({ ok: true, orderId: rows[0].id, invalidated: true });
  } catch (e) {
    res.status(500).json({ error: { code: 'ORDER_FAILED', message: (e as Error).message } });
  }
});

app.get('/api/health', async (_req, res) => {
  const t0 = performance.now();
  const out: Record<string, unknown> = { ok: true };
  try {
    await pool.query('SELECT 1');
    out.postgres = 'up';
  } catch {
    out.postgres = 'down';
    out.ok = false;
  }
  try {
    await redis.ping();
    out.redis = 'up';
  } catch {
    out.redis = 'down';
    out.ok = false;
  }
  out.elapsedMs = Math.round(performance.now() - t0);
  res.status(out.ok ? 200 : 503).json(out);
});

app.listen(config.port, () => {
  console.log(`leaderboard API on :${config.port} (cache TTL ${config.cacheTtlSeconds}s)`);
});
