import { create } from 'zustand';

import type { Option } from '@/types';

export type ThemePreference = 'system' | 'light' | 'dark';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  language: Option;
  setLanguage: (language: Option) => void;
};

export const usePreferencesStore = create<PreferencesState>(set => ({
  theme: 'system',
  setTheme: theme => set({ theme }),
  language: { id: 'en', label: 'English' },
  setLanguage: language => set({ language }),
}));
