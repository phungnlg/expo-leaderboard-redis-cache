export type Source = 'cache' | 'db';

export interface LeaderboardItem {
  rank: number;
  productId: number;
  name: string;
  category: string;
  orderCount: number;
  unitsSold: number;
  revenue: number;
  avgRating: number;
}

export interface ResponseMeta {
  source: Source;
  /** server-measured time (Node) in ms */
  serverMs: number;
  /** total client round-trip in ms */
  clientMs: number;
  servedAt: string;
  ttlRemaining: number;
}

export interface LeaderboardResponse {
  items: LeaderboardItem[];
  meta: ResponseMeta;
}

export interface ProductStats extends LeaderboardItem {
  /** last 7 days revenue trend, mock sparkline */
  trend: number[];
}

export interface ProductStatsResponse {
  product: ProductStats;
  meta: ResponseMeta;
}
