import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useAuthStore } from '@/services/auth/useAuthStore';
import {
  type ThemePreference,
  usePreferencesStore,
} from '@/services/config/usePreferencesStore';
import type { TabAppNavigation } from '@/types';

import { PROFILE } from '../mock';

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

export const useWorkerProfile = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const signOut = useAuthStore(s => s.signOut);
  const theme = usePreferencesStore(s => s.theme);
  const setTheme = usePreferencesStore(s => s.setTheme);
  const language = usePreferencesStore(s => s.language);

  return {
    isLoading,
    profile: PROFILE,
    initials: initialsOf(PROFILE.fullName),
    theme,
    languageLabel: language.label,
    cycleTheme: () =>
      setTheme(
        THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length],
      ),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openEditProfile: () => navigation.navigate(ROUTES.editProfile),
    openPayouts: () => navigation.navigate(ROUTES.payoutAccount),
    openLanguage: () => navigation.navigate(ROUTES.language),
    openFaq: () => navigation.navigate(ROUTES.faq),
    openTerms: () => navigation.navigate(ROUTES.terms),
    signOut,
  };
};
