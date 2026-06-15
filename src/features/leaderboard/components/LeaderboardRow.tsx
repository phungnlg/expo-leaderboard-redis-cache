import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fmtMoney, theme } from '@/theme';
import type { LeaderboardItem } from '@/features/leaderboard/types';

function medalColor(rank: number): string | null {
  if (rank === 1) return theme.gold;
  if (rank === 2) return theme.silver;
  if (rank === 3) return theme.bronze;
  return null;
}

function RowBase({ item, onPress }: { item: LeaderboardItem; onPress: (id: number) => void }) {
  const medal = medalColor(item.rank);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(item.productId)}
    >
      <View style={[styles.rankBadge, medal ? { backgroundColor: medal } : null]}>
        <Text style={[styles.rankText, medal ? { color: '#10172A' } : null]}>{item.rank}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          {item.category} · {item.orderCount.toLocaleString()} orders ·{' '}
          <Ionicons name="star" size={11} color={theme.gold} /> {item.avgRating.toFixed(1)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.revenue}>{fmtMoney(item.revenue)}</Text>
        <Text style={styles.units}>{item.unitsSold.toLocaleString()} sold</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
    </Pressable>
  );
}

export const LeaderboardRow = memo(RowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pressed: { opacity: 0.6 },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: theme.text, fontWeight: '800', fontSize: 14 },
  body: { flex: 1 },
  name: { color: theme.text, fontWeight: '700', fontSize: 15 },
  meta: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  revenue: { color: theme.cache, fontWeight: '800', fontSize: 15 },
  units: { color: theme.textDim, fontSize: 11, marginTop: 2 },
});
