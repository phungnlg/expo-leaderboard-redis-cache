import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

export function SkeletonList() {
  return (
    <View style={{ paddingTop: 8 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={styles.skeleton} />
      ))}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline" size={40} color={theme.db} />
      <Text style={styles.title}>Could not load</Text>
      <Text style={styles.msg}>{message}</Text>
      <Pressable style={styles.retry} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

export function EmptyView() {
  return (
    <View style={styles.center}>
      <Ionicons name="podium-outline" size={40} color={theme.textDim} />
      <Text style={styles.title}>No ranked products</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 64,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.surface,
    opacity: 0.5,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  title: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 8 },
  msg: { color: theme.textDim, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  retry: {
    marginTop: 16,
    backgroundColor: theme.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
