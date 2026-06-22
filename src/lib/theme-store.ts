import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from './i18n';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: ThemeMode;
  animations: boolean;
  locale: Locale;
  setTheme: (theme: ThemeMode) => void;
  setAnimations: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
  resolvedTheme: () => 'dark' | 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      animations: true,
      locale: 'en',

      setTheme: (theme) => set({ theme }),
      setAnimations: (animations) => set({ animations }),
      setLocale: (locale) => set({ locale }),

      resolvedTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    { name: 'life-os-theme' }
  )
);
