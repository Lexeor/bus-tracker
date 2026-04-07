import { DARK_MODE_KEY } from '@/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleDark: () => void;
}

const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: systemDark,
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: DARK_MODE_KEY },
  ),
);
