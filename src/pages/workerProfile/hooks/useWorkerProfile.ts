import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { mediaUrl, meApi } from '@/services/api/meApi';
import { logoutAuthSession } from '@/services/auth';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { TabAppNavigation } from '@/types';
import { initialsOf } from '@/utils/format';

export const useWorkerProfile = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const query = useApiQuery(() => meApi.profile(), []);
  const account = query.data?.account;
  const worker = query.data?.worker;
  const fullName = worker?.full_name ?? account?.full_name ?? '';
  const theme = usePreferencesStore(s => s.theme);
  const language = usePreferencesStore(s => s.language);

  return {
    isLoading: query.isLoading,
    profile: {
      fullName,
      location: worker?.locality || worker?.address_text || '',
      photoUri: mediaUrl(worker?.photo_url ?? account?.photo_url),
    },
    initials: initialsOf(fullName),
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
    signOut: logoutAuthSession,
  };
};
