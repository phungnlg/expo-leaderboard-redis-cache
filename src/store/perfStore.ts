import { create } from 'zustand';
import type { ResponseMeta, Source } from '@/features/leaderboard/types';

export interface ReadRecord {
  source: Source;
  serverMs: number;
  clientMs: number;
  ts: number;
}

interface PerfState {
  last: ResponseMeta | null;
  /** previous read, pinned for compareMode before/after delta */
  previous: ResponseMeta | null;
  history: ReadRecord[];
  recordRead: (meta: ResponseMeta) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 12;

export const usePerfStore = create<PerfState>((set) => ({
  last: null,
  previous: null,
  history: [],
  recordRead: (meta) =>
    set((s) => ({
      previous: s.last,
      last: meta,
      history: [
        { source: meta.source, serverMs: meta.serverMs, clientMs: meta.clientMs, ts: Date.now() },
        ...s.history,
      ].slice(0, MAX_HISTORY),
    })),
  clearHistory: () => set({ history: [], last: null, previous: null }),
}));
