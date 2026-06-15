import type { LeaderboardItem } from '@/features/leaderboard/types';

/**
 * Mockup dataset. Mirrors the shape the Node API returns from the
 * PostgreSQL aggregation (JOIN products + orders + reviews, GROUP BY,
 * ORDER BY revenue DESC). Pre-sorted by revenue so rank == index + 1.
 *
 * On the real backend these numbers come from ~50k seeded order rows;
 * here they are baked in so the app demos standalone on a simulator.
 */
const RAW: Omit<LeaderboardItem, 'rank'>[] = [
  { productId: 101, name: 'Aurora Wireless Earbuds', category: 'Audio', orderCount: 4821, unitsSold: 6190, revenue: 742800, avgRating: 4.8 },
  { productId: 102, name: 'Nimbus Mechanical Keyboard', category: 'Accessories', orderCount: 3970, unitsSold: 4510, revenue: 631400, avgRating: 4.7 },
  { productId: 103, name: 'Vertex 4K Action Cam', category: 'Cameras', orderCount: 2640, unitsSold: 2890, revenue: 578000, avgRating: 4.6 },
  { productId: 104, name: 'Pulse Smartwatch S3', category: 'Wearables', orderCount: 3110, unitsSold: 3380, revenue: 540800, avgRating: 4.5 },
  { productId: 105, name: 'Drift Noise-Cancel Headphones', category: 'Audio', orderCount: 2280, unitsSold: 2460, revenue: 492000, avgRating: 4.7 },
  { productId: 106, name: 'Quartz Portable SSD 2TB', category: 'Storage', orderCount: 3540, unitsSold: 3890, revenue: 466800, avgRating: 4.9 },
  { productId: 107, name: 'Halo Desk Lamp Pro', category: 'Home', orderCount: 4012, unitsSold: 4760, revenue: 428400, avgRating: 4.4 },
  { productId: 108, name: 'Forge USB-C Hub 9-in-1', category: 'Accessories', orderCount: 3320, unitsSold: 3710, revenue: 389550, avgRating: 4.3 },
  { productId: 109, name: 'Cobalt Gaming Mouse', category: 'Accessories', orderCount: 2890, unitsSold: 3120, revenue: 356800, avgRating: 4.6 },
  { productId: 110, name: 'Ember Travel Mug 2.0', category: 'Home', orderCount: 5210, unitsSold: 6840, revenue: 341000, avgRating: 4.5 },
  { productId: 111, name: 'Slate E-Reader Glow', category: 'Reading', orderCount: 1980, unitsSold: 2110, revenue: 316500, avgRating: 4.8 },
  { productId: 112, name: 'Apex Standing Desk Mat', category: 'Home', orderCount: 2740, unitsSold: 3050, revenue: 289750, avgRating: 4.2 },
  { productId: 113, name: 'Lumen Ring Light 18in', category: 'Cameras', orderCount: 2410, unitsSold: 2680, revenue: 268000, avgRating: 4.4 },
  { productId: 114, name: 'Tidal Waterproof Speaker', category: 'Audio', orderCount: 2150, unitsSold: 2330, revenue: 244650, avgRating: 4.6 },
  { productId: 115, name: 'Onyx Webcam 1440p', category: 'Cameras', orderCount: 1870, unitsSold: 1990, revenue: 219000, avgRating: 4.3 },
  { productId: 116, name: 'Briar Laptop Sleeve 15"', category: 'Bags', orderCount: 3290, unitsSold: 3640, revenue: 196560, avgRating: 4.5 },
  { productId: 117, name: 'Glide Trackpad Wireless', category: 'Accessories', orderCount: 1540, unitsSold: 1680, revenue: 178080, avgRating: 4.1 },
  { productId: 118, name: 'Cedar Bamboo Phone Stand', category: 'Home', orderCount: 4380, unitsSold: 5210, revenue: 156300, avgRating: 4.7 },
  { productId: 119, name: 'Flux Fast Charger 65W', category: 'Power', orderCount: 3760, unitsSold: 4190, revenue: 142460, avgRating: 4.6 },
  { productId: 120, name: 'Marble Cable Organizer Set', category: 'Accessories', orderCount: 5040, unitsSold: 7320, revenue: 124440, avgRating: 4.4 },
  { productId: 121, name: 'Pebble Mini Bluetooth Tracker', category: 'Power', orderCount: 2620, unitsSold: 3010, revenue: 105350, avgRating: 4.2 },
  { productId: 122, name: 'Vista Blue-Light Glasses', category: 'Wearables', orderCount: 2980, unitsSold: 3290, revenue: 98700, avgRating: 4.3 },
  { productId: 123, name: 'Sol Solar Power Bank', category: 'Power', orderCount: 1720, unitsSold: 1840, revenue: 91900, avgRating: 4.0 },
  { productId: 124, name: 'Knox Privacy Screen Filter', category: 'Accessories', orderCount: 1410, unitsSold: 1520, revenue: 76000, avgRating: 4.1 },
  { productId: 125, name: 'Mist Mini Humidifier', category: 'Home', orderCount: 3180, unitsSold: 3870, revenue: 67700, avgRating: 4.5 },
];

export const PRODUCTS: LeaderboardItem[] = RAW.map((p, i) => ({ ...p, rank: i + 1 }));

/** mock 7-day revenue trend for the detail sparkline, derived from product id */
export function trendFor(productId: number): number[] {
  const base = (productId % 7) + 3;
  return Array.from({ length: 7 }, (_, d) => {
    const wobble = ((productId * (d + 1)) % 9) - 4;
    return Math.max(1, base * 4 + wobble);
  });
}
