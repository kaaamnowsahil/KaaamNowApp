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
  /** True after AsyncStorage has loaded. Until then `language` is only the default. */
  hasHydrated: boolean;
  /** True when this device already has a saved language, including English. */
  languagePersisted: boolean;
};

const PREFERENCES_KEY = 'KaaamNow-preferences';
let persistedLanguageId: string | null = null;

const readPersistedLanguageId = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const id = JSON.parse(raw)?.state?.language?.id;
    return typeof id === 'string' && id ? id : null;
  } catch {
    return null;
  }
};

/**
 * Safe AsyncStorage wrapper — falls back to in-memory if the native module
 * is not linked yet (e.g. Metro/web dev without a native rebuild).
 * Once the native app is rebuilt after `pod install`, real persistence kicks in.
 */
const memoryFallback = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    let raw: string | null;
    try {
      raw = await AsyncStorage.getItem(key);
    } catch {
      raw = memoryFallback.get(key) ?? null;
    }
    if (key === PREFERENCES_KEY) persistedLanguageId = readPersistedLanguageId(raw);
    return raw;
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
      hasHydrated: false,
      languagePersisted: false,
      setLanguage: language => set({ language, languagePersisted: true }),
    }),
    {
      name: PREFERENCES_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: state => ({
        theme: state.theme,
        language: state.language,
      }),
      onRehydrateStorage: () => () => {
        usePreferencesStore.setState({
          hasHydrated: true,
          languagePersisted: persistedLanguageId != null,
        });
      },
    },
  ),
);
