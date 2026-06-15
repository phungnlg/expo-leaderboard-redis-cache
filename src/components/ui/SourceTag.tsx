import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import type { Source } from '@/features/leaderboard/types';

export function SourceTag({ source, small }: { source: Source; small?: boolean }) {
  const isCache = source === 'cache';
  const color = isCache ? theme.cache : theme.db;
  return (
    <View style={[styles.pill, { borderColor: color }, small && styles.pillSmall]}>
      <Ionicons
        name={isCache ? 'flash' : 'server'}
        size={small ? 11 : 13}
        color={color}
      />
      <Text style={[styles.label, { color }, small && styles.labelSmall]}>
        {isCache ? 'REDIS CACHE' : 'POSTGRES'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  pillSmall: { paddingHorizontal: 7, paddingVertical: 2, gap: 3 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  labelSmall: { fontSize: 10 },
});
