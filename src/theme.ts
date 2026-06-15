export const theme = {
  bg: '#0B1220',
  surface: '#141E33',
  surfaceAlt: '#1C2942',
  border: '#26334D',
  text: '#E8EEF9',
  textDim: '#8FA0BC',
  cache: '#34D399', // green - fast / Redis hit
  db: '#FBBF24', // amber - slow / Postgres miss
  accent: '#5B8DEF',
  gold: '#F4C95D',
  silver: '#C7D0DD',
  bronze: '#CD8B5B',
} as const;

export function latencyColor(ms: number): string {
  if (ms < 30) return theme.cache;
  if (ms > 150) return theme.db;
  return theme.accent;
}

export function fmtMoney(n: number): string {
  return '$' + n.toLocaleString('en-US');
}
