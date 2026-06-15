export const config = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/leaderboard',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  port: Number(process.env.PORT ?? 4000),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 60),
  seedOrders: Number(process.env.SEED_ORDERS ?? 50000),
};
