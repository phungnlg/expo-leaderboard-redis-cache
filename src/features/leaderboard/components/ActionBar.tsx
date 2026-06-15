import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface Props {
  onReload: () => void;
  onForceRefresh: () => void;
  busy: boolean;
}

export function ActionBar({ onReload, onForceRefresh, busy }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.reload, pressed && styles.pressed]}
        onPress={onReload}
        disabled={busy}
      >
        <Ionicons name="refresh" size={18} color={theme.text} />
        <Text style={styles.btnText}>Reload</Text>
        <Text style={styles.hint}>expect HIT</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.btn, styles.force, pressed && styles.pressed]}
        onPress={onForceRefresh}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={theme.db} size="small" />
        ) : (
          <Ionicons name="flame" size={18} color={theme.db} />
        )}
        <Text style={[styles.btnText, { color: theme.db }]}>Force refresh</Text>
        <Text style={[styles.hint, { color: theme.db }]}>bust cache → MISS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.bg,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  reload: { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  force: { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: theme.db },
  pressed: { opacity: 0.6 },
  btnText: { color: theme.text, fontWeight: '700', fontSize: 14, marginTop: 2 },
  hint: { color: theme.textDim, fontSize: 10 },
});
