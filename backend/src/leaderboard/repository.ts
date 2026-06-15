import { pool } from '../db/pool';

export interface Row {
  productId: number;
  name: string;
  category: string;
  orderCount: number;
  unitsSold: number;
  revenue: number;
  avgRating: number;
}

/**
 * The deliberately expensive aggregation: double LEFT JOIN + GROUP BY +
 * ORDER BY + AVG over tens of thousands of order rows. This is the work the
 * Redis cache eliminates on a hit. Indexes help point lookups, not this
 * full-table aggregate - which is exactly why caching is the right lever.
 */
const SQL = `
  SELECT p.id                              AS "productId",
         p.name                            AS name,
         p.category                        AS category,
         COUNT(DISTINCT o.id)              AS "orderCount",
         COALESCE(SUM(o.qty), 0)           AS "unitsSold",
         COALESCE(SUM(o.amount), 0)        AS revenue,
         COALESCE(AVG(r.rating), 0)        AS "avgRating"
  FROM products p
  LEFT JOIN orders  o ON o.product_id = p.id
  LEFT JOIN reviews r ON r.product_id = p.id
  GROUP BY p.id
  ORDER BY revenue DESC, "orderCount" DESC
  LIMIT $1
`;

export async function aggregateLeaderboard(limit: number): Promise<Row[]> {
  const { rows } = await pool.query(SQL, [limit]);
  return rows.map((r) => ({
    productId: Number(r.productId),
    name: r.name,
    category: r.category,
    orderCount: Number(r.orderCount),
    unitsSold: Number(r.unitsSold),
    revenue: Math.round(Number(r.revenue)),
    avgRating: Number(Number(r.avgRating).toFixed(2)),
  }));
}
