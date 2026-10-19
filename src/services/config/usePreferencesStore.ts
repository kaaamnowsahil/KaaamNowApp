import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

export const usePreferencesStore = create<PreferencesState>(set => ({
  theme: 'system',
  setTheme: theme => set({ theme }),
}));
