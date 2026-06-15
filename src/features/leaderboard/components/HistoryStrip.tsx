import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { usePerfStore } from '@/store/perfStore';

export function HistoryStrip() {
  const history = usePerfStore((s) => s.history);
  if (history.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>reads</Text>
      <View style={styles.row}>
        {history.map((h, i) => (
          <View
            key={h.ts + '-' + i}
            style={[
              styles.tick,
              { backgroundColor: h.source === 'cache' ? theme.cache : theme.db },
            ]}
          />
        ))}
      </View>
      <Text style={styles.legend}>
        <Text style={{ color: theme.cache }}>● cache</Text>{'  '}
        <Text style={{ color: theme.db }}>● db</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  label: { color: theme.textDim, fontSize: 12, width: 38 },
  row: { flexDirection: 'row', gap: 4, flex: 1 },
  tick: { width: 10, height: 18, borderRadius: 3 },
  legend: { fontSize: 11, fontWeight: '600' },
});
