import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { SourceTag } from '@/components/ui/SourceTag';
import { getProductStats } from '@/features/leaderboard/services/leaderboard.api';
import type { ProductStatsResponse } from '@/features/leaderboard/types';
import { ErrorView, SkeletonList } from '@/features/leaderboard/components/StateViews';
import { fmtMoney, theme } from '@/theme';

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.spark}>
      {data.map((v, i) => (
        <View key={i} style={[styles.bar, { height: 8 + (v / max) * 48 }]} />
      ))}
    </View>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const [res, setRes] = useState<ProductStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setRes(null);
    getProductStats(productId)
      .then(setRes)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  };

  useEffect(load, [productId]);

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!res) return <SkeletonList />;

  const { product, meta } = res;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.perfCard}>
        <View style={styles.perfTop}>
          <SourceTag source={meta.source} small />
          <Text style={styles.key}>product:stats:{product.productId}</Text>
        </View>
        <LatencyBadge ms={meta.serverMs} label="this endpoint is cache-aside too" />
      </View>

      <Text style={styles.rank}>#{product.rank}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.category}</Text>

      <View style={styles.statsRow}>
        <Stat label="Revenue" value={fmtMoney(product.revenue)} color={theme.cache} />
        <Stat label="Orders" value={product.orderCount.toLocaleString()} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Units sold" value={product.unitsSold.toLocaleString()} />
        <Stat label="Avg rating" value={product.avgRating.toFixed(1) + ' ★'} color={theme.gold} />
      </View>

      <Text style={styles.trendLabel}>Revenue trend, last 7 days</Text>
      <Sparkline data={product.trend} />

      <View style={styles.note}>
        <Ionicons name="information-circle" size={16} color={theme.accent} />
        <Text style={styles.noteText}>
          Same cache-aside pattern at product granularity: a per-product Redis key fronts the
          PostgreSQL row aggregation. Reopen to see the HIT.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  perfCard: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  perfTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  key: { color: theme.textDim, fontSize: 11, fontFamily: 'Courier' },
  rank: { color: theme.accent, fontSize: 16, fontWeight: '800' },
  name: { color: theme.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  category: { color: theme.textDim, fontSize: 14, marginTop: 2, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  statValue: { color: theme.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: theme.textDim, fontSize: 12, marginTop: 4 },
  trendLabel: { color: theme.textDim, fontSize: 13, marginTop: 8, marginBottom: 10 },
  spark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 64,
    paddingHorizontal: 4,
  },
  bar: { flex: 1, backgroundColor: theme.accent, borderRadius: 4 },
  note: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
  },
  noteText: { color: theme.textDim, fontSize: 12, lineHeight: 18, flex: 1 },
});
