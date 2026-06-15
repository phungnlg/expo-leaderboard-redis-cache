import { useCallback, useEffect, useRef, useState } from 'react';
import {
  forceRefresh as apiForceRefresh,
  getLeaderboard,
} from '@/features/leaderboard/services/leaderboard.api';
import type { LeaderboardItem } from '@/features/leaderboard/types';
import { usePerfStore } from '@/store/perfStore';
import { useUiStore } from '@/store/uiStore';

interface State {
  items: LeaderboardItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export function useLeaderboard() {
  const limit = useUiStore((s) => s.limit);
  const recordRead = usePerfStore((s) => s.recordRead);
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    refreshing: false,
    error: null,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (mode: 'initial' | 'reload' | 'force') => {
      setState((s) => ({
        ...s,
        loading: mode === 'initial',
        refreshing: mode !== 'initial',
        error: null,
      }));
      try {
        const res =
          mode === 'force' ? await apiForceRefresh(limit) : await getLeaderboard(limit);
        if (!mounted.current) return;
        recordRead(res.meta);
        setState({ items: res.items, loading: false, refreshing: false, error: null });
      } catch (e) {
        if (!mounted.current) return;
        setState((s) => ({
          ...s,
          loading: false,
          refreshing: false,
          error: e instanceof Error ? e.message : 'Failed to load leaderboard',
        }));
      }
    },
    [limit, recordRead],
  );

  // initial load + reload when limit changes
  useEffect(() => {
    run('initial');
  }, [run]);

  return {
    ...state,
    reload: () => run('reload'),
    forceRefresh: () => run('force'),
  };
}
