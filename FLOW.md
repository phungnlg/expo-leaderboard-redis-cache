# Screenshot regeneration flow

The images in `screenshots/` are real captures from the iOS Simulator, taken with
the app running on built-in mock data (no backend needed).

## Steps

1. Boot a simulator and open it:

   ```bash
   xcrun simctl boot "iPhone 17 Pro"
   open -a Simulator
   ```

2. Install deps and build the dev client (reanimated and gesture-handler are
   native modules, so this needs a dev build, not Expo Go):

   ```bash
   npm install
   npx expo run:ios --device "iPhone 17 Pro"
   ```

   This runs `expo prebuild` (generates `ios/`), `pod install`, builds, installs,
   and starts Metro.

3. Launch the app and capture each screen:

   ```bash
   xcrun simctl launch booted com.phungnlg.leaderboardcache

   # 01 - first load is a cold cache MISS: POSTGRES tag, ~280ms badge
   xcrun simctl io booted screenshot screenshots/01-leaderboard-miss.png

   # tap "Reload" -> cache HIT, then:
   # 02 - REDIS CACHE tag, single-digit ms, compare delta "Nx faster"
   xcrun simctl io booted screenshot screenshots/02-leaderboard-hit.png

   # tap a product row, then:
   xcrun simctl io booted screenshot screenshots/03-product-detail.png

   # open the "How it works" tab, then:
   xcrun simctl io booted screenshot screenshots/04-how-it-works.png
   ```

## How it works

- The app runs in MOCK mode by default (`EXPO_PUBLIC_API_URL` unset). The API
  layer in `src/features/leaderboard/services/leaderboard.api.ts` simulates the
  measured backend latencies: a cold cache MISS sleeps ~280ms (the PostgreSQL
  aggregation), a warm HIT sleeps ~6ms (the Redis read).
- An in-memory `Set` of "warm keys" mirrors Redis state: the first read after a
  Force refresh (or TTL expiry) is a guaranteed MISS, every subsequent read is a
  HIT - exactly the deterministic before/after the demo is built around.
- The leaderboard rows come from `src/data/products.ts`, pre-sorted by revenue so
  rank == index + 1, matching the shape the real Node API returns from the
  `JOIN + GROUP BY + ORDER BY` query.
