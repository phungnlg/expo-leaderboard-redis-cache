import { StyleSheet, Text, View } from 'react-native';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { SourceTag } from '@/components/ui/SourceTag';
import { fmtMoney, theme } from '@/theme';
import { usePerfStore } from '@/store/perfStore';
import { useUiStore } from '@/store/uiStore';

export function PerfHeader() {
  const last = usePerfStore((s) => s.last);
  const previous = usePerfStore((s) => s.previous);
  const compareMode = useUiStore((s) => s.compareMode);

  if (!last) return null;

  const speedup =
    compareMode && previous && previous.source !== last.source
      ? Math.round(Math.max(previous.serverMs, last.serverMs) / Math.max(1, Math.min(previous.serverMs, last.serverMs)))
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SourceTag source={last.source} />
        <Text style={styles.served}>
          {last.ttlRemaining > 0 ? `TTL ${last.ttlRemaining}s` : 'expired'}
        </Text>
      </View>

      <View style={styles.metricRow}>
        <LatencyBadge ms={last.serverMs} label="server time" />
        {compareMode && previous && previous.source !== last.source ? (
          <View style={styles.delta}>
            <Text style={styles.deltaLine}>
              {previous.source === 'db' ? 'was' : 'was'}{' '}
              <Text style={{ color: previous.source === 'cache' ? theme.cache : theme.db }}>
                {previous.serverMs}ms ({previous.source === 'cache' ? 'cache' : 'db'})
              </Text>
            </Text>
            {speedup ? (
              <Text style={styles.speedup}>
                {speedup}x {last.serverMs < previous.serverMs ? 'faster' : 'slower'}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text style={styles.sub}>
        round-trip {last.clientMs}ms · {fmtSource(last.source)}
      </Text>
    </View>
  );
}

function fmtSource(s: string): string {
  return s === 'cache'
    ? 'served from Redis, no DB query'
    : 'aggregated in PostgreSQL, then cached';
}

// kept for potential reuse
export const _fmtMoney = fmtMoney;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  served: { color: theme.textDim, fontSize: 12, fontWeight: '600' },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  delta: { alignItems: 'flex-end' },
  deltaLine: { color: theme.textDim, fontSize: 13 },
  speedup: { color: theme.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  sub: { color: theme.textDim, fontSize: 12, marginTop: 10 },
});
