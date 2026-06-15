import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionBar } from '@/features/leaderboard/components/ActionBar';
import { HistoryStrip } from '@/features/leaderboard/components/HistoryStrip';
import { LeaderboardRow } from '@/features/leaderboard/components/LeaderboardRow';
import { PerfHeader } from '@/features/leaderboard/components/PerfHeader';
import { EmptyView, ErrorView, SkeletonList } from '@/features/leaderboard/components/StateViews';
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useUiStore, type LimitOption } from '@/store/uiStore';
import { theme } from '@/theme';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, loading, refreshing, error, reload, forceRefresh } = useLeaderboard();
  const limit = useUiStore((s) => s.limit);
  const setLimit = useUiStore((s) => s.setLimit);
  const compareMode = useUiStore((s) => s.compareMode);
  const toggleCompare = useUiStore((s) => s.toggleCompare);

  const onPressRow = useCallback(
    (id: number) => router.push(`/product/${id}`),
    [router],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.h1}>Top Products</Text>
          <Text style={styles.h2}>ranked by revenue · cached aggregation</Text>
        </View>
        <View style={styles.toggles}>
          {([10, 25] as LimitOption[]).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLimit(l)}
              style={[styles.chip, limit === l && styles.chipActive]}
            >
              <Text style={[styles.chipText, limit === l && styles.chipTextActive]}>
                Top {l}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={toggleCompare} style={styles.compareToggle}>
        <View style={[styles.dot, compareMode && styles.dotOn]} />
        <Text style={styles.compareText}>
          Compare mode {compareMode ? 'on' : 'off'} - pin db vs cache delta
        </Text>
      </Pressable>

      <PerfHeader />
      <HistoryStrip />

      {error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyView />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.productId)}
          renderItem={({ item }) => <LeaderboardRow item={item} onPress={onPressRow} />}
          contentContainerStyle={{ paddingVertical: 4 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={theme.accent} />
          }
        />
      )}

      <ActionBar onReload={reload} onForceRefresh={forceRefresh} busy={refreshing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  h1: { color: theme.text, fontSize: 24, fontWeight: '800' },
  h2: { color: theme.textDim, fontSize: 13, marginTop: 2 },
  toggles: { flexDirection: 'row', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.textDim, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  dotOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  compareText: { color: theme.textDim, fontSize: 12 },
});
