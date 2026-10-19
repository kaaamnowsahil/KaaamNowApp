import type { ThemePreference } from '@/services/config/usePreferencesStore';

export const APPEARANCE_OPTIONS: {
  id: ThemePreference;
  title: string;
  caption: string;
}[] = [
  { id: 'light', title: 'Light', caption: 'Clean, white-first surfaces · Default' },
  { id: 'dark', title: 'Dark', caption: 'Lower-glare surfaces for low light' },
];
