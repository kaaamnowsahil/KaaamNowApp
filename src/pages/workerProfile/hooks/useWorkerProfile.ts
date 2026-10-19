import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import type { TabAppNavigation } from '@/types';
import { initialsOf } from '@/utils/format';

import { PROFILE } from '../mock';

export const useWorkerProfile = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const signOut = useAuthStore(s => s.signOut);
  const theme = usePreferencesStore(s => s.theme);
  const language = usePreferencesStore(s => s.language);

  return {
    isLoading,
    profile: PROFILE,
    initials: initialsOf(PROFILE.fullName),
    theme,
    languageLabel: language.label,
    openAppearance: () => navigation.navigate(ROUTES.appearance),
    openOffline: () => navigation.navigate(ROUTES.offline),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openEditProfile: () => navigation.navigate(ROUTES.editProfile),
    openPayouts: () => navigation.navigate(ROUTES.payoutAccount),
    openLanguage: () => navigation.navigate(ROUTES.language),
    openFaq: () => navigation.navigate(ROUTES.faq),
    openTerms: () => navigation.navigate(ROUTES.terms),
    signOut,
  };
};
