import { create } from 'zustand';

export type LimitOption = 10 | 25;

interface UiState {
  limit: LimitOption;
  compareMode: boolean;
  setLimit: (l: LimitOption) => void;
  toggleCompare: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  limit: 10,
  compareMode: true,
  setLimit: (limit) => set({ limit }),
  toggleCompare: () => set((s) => ({ compareMode: !s.compareMode })),
}));
