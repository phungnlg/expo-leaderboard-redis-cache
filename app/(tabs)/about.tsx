import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { config } from '@/features/leaderboard/services/leaderboard.api';
import { theme } from '@/theme';

function Step({ icon, color, title, body }: { icon: any; color: string; title: string; body: string }) {
  return (
    <View style={styles.step}>
      <Ionicons name={icon} size={22} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.h1}>Cache-aside, end to end</Text>
      <Text style={styles.p}>
        One screen exercises the full stack: React Native UI calls a Node.js + TypeScript API, which
        reads from PostgreSQL and caches the result in Redis. The leaderboard is an expensive
        aggregation, so caching is the real performance lever.
      </Text>

      <View style={styles.flow}>
        <Text style={styles.flowText}>React Native</Text>
        <Ionicons name="arrow-down" size={16} color={theme.textDim} />
        <Text style={styles.flowText}>Node.js / Express API</Text>
        <Ionicons name="arrow-down" size={16} color={theme.textDim} />
        <Text style={[styles.flowText, { color: theme.cache }]}>Redis (GET key)</Text>
        <Text style={styles.flowSplit}>hit → return · miss ↓</Text>
        <Text style={[styles.flowText, { color: theme.db }]}>PostgreSQL JOIN + GROUP BY</Text>
        <Ionicons name="arrow-up" size={16} color={theme.textDim} />
        <Text style={[styles.flowText, { color: theme.cache }]}>SET key EX 60 → return</Text>
      </View>

      <Step
        icon="server"
        color={theme.db}
        title="Cache MISS"
        body={`Aggregate JOIN products + orders + reviews, GROUP BY, ORDER BY revenue over ~50k rows. ~${config.DB_LATENCY_MS}ms cold.`}
      />
      <Step
        icon="flash"
        color={theme.cache}
        title="Cache HIT"
        body={`Pre-serialized JSON returned straight from Redis. Single-digit ms - no query, no re-serialization.`}
      />
      <Step
        icon="key"
        color={theme.accent}
        title="Key + TTL"
        body={`leaderboard:v1:all:{limit} with a ${config.TTL_SECONDS}s TTL. Writes UNLINK the key; TTL is the self-healing safety net.`}
      />
      <Step
        icon="flame"
        color={theme.db}
        title="Force refresh"
        body="Calls POST /leaderboard/refresh which DELs the key, so the next read is a guaranteed MISS - a deterministic before/after in two taps."
      />

      <View style={styles.note}>
        <Text style={styles.noteText}>
          {config.USE_MOCK
            ? 'Running in MOCK mode: latencies are simulated so the app demos standalone. Set EXPO_PUBLIC_API_URL to hit the real Node + PostgreSQL + Redis backend in /backend.'
            : `Live mode: ${config.API_URL}`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  p: { color: theme.textDim, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  flow: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  flowText: { color: theme.text, fontWeight: '700', fontSize: 14 },
  flowSplit: { color: theme.textDim, fontSize: 11 },
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  stepTitle: { color: theme.text, fontWeight: '700', fontSize: 15 },
  stepBody: { color: theme.textDim, fontSize: 13, marginTop: 3, lineHeight: 19 },
  note: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  noteText: { color: theme.textDim, fontSize: 12, lineHeight: 18 },
});
