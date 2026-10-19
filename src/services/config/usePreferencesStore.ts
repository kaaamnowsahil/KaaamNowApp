import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Option } from '@/types';

export type ThemePreference = 'light' | 'dark';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  language: Option;
  setLanguage: (language: Option) => void;
};

/**
 * Safe AsyncStorage wrapper — falls back to in-memory if the native module
 * is not linked yet (e.g. Metro/web dev without a native rebuild).
 * Once the native app is rebuilt after `pod install`, real persistence kicks in.
 */
const memoryFallback = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryFallback.set(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryFallback.delete(key);
    }
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      theme: 'light',
      setTheme: theme => set({ theme }),
      language: { id: 'en', label: 'English' },
      setLanguage: language => set({ language }),
    }),
    {
      name: 'KaaamNow-preferences',
      storage: createJSONStorage(() => safeStorage),
      partialize: state => ({
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);
