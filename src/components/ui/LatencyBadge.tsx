import { StyleSheet, Text, View } from 'react-native';
import { latencyColor, theme } from '@/theme';

export function LatencyBadge({ ms, label }: { ms: number; label?: string }) {
  const color = latencyColor(ms);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.value, { color }]}>{ms}</Text>
      <Text style={[styles.unit, { color }]}>ms</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end' },
  value: { fontSize: 40, fontWeight: '800', lineHeight: 42 },
  unit: { fontSize: 16, fontWeight: '700', marginBottom: 5, marginLeft: 2 },
  label: { color: theme.textDim, fontSize: 12, marginBottom: 7, marginLeft: 8 },
});
