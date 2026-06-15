import { performance } from 'node:perf_hooks';
import type { Request, Response } from 'express';
import { getLeaderboard, invalidateLeaderboard } from './service';

function clampLimit(raw: unknown): number {
  const n = Number(raw ?? 20);
  if (!Number.isFinite(n)) return 20;
  return Math.min(100, Math.max(1, Math.trunc(n)));
}

// GET /api/leaderboard?limit=20&category=all
export async function getLeaderboardHandler(req: Request, res: Response) {
  const t0 = performance.now();
  const limit = clampLimit(req.query.limit);
  const category = String(req.query.category ?? 'all');
  try {
    const result = await getLeaderboard(category, limit);
    res.json({
      source: result.source,
      elapsedMs: Math.round(performance.now() - t0),
      generatedAt: result.generatedAt,
      ttlRemaining: result.ttlRemaining,
      count: result.count,
      items: result.items,
    });
  } catch (e) {
    res.status(500).json({ error: { code: 'AGGREGATION_FAILED', message: (e as Error).message } });
  }
}

// POST /api/leaderboard/refresh -> bust cache, return fresh DB-computed result
export async function refreshHandler(_req: Request, res: Response) {
  const t0 = performance.now();
  try {
    await invalidateLeaderboard();
    const result = await getLeaderboard('all', 20);
    res.json({
      source: result.source, // always 'db' right after invalidation
      elapsedMs: Math.round(performance.now() - t0),
      generatedAt: result.generatedAt,
      ttlRemaining: result.ttlRemaining,
      count: result.count,
      items: result.items,
      invalidated: true,
    });
  } catch (e) {
    res.status(500).json({ error: { code: 'REFRESH_FAILED', message: (e as Error).message } });
  }
}
