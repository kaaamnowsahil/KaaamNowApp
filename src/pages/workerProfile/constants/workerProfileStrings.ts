import type { ThemePreference } from '@/services/config/usePreferencesStore';

export const WORKER_PROFILE_STRINGS = {
  ACCOUNT: 'Account',
  EDIT_PROFILE: 'Edit profile',
  PAYOUT_ACCOUNT: 'Payout account',
  PREFERENCES: 'Preferences',
  LANGUAGE: 'Language',
  APP_THEME: 'App theme',
  THEME_LABEL: {
    light: 'Light',
    dark: 'Dark',
  } as Record<ThemePreference, string>,
  SUPPORT: 'Support',
  FAQ: 'FAQ & Help',
  OFFLINE: 'Offline access',
  TERMS: 'Terms & Conditions',
  LOG_OUT: 'Log out',
} as const;
