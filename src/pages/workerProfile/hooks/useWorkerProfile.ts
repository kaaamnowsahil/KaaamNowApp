import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { mediaUrl, meApi } from '@/services/api/meApi';
import { logoutAuthSession } from '@/services/auth';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { navigateToNotifications } from '@/services/notifications/navigateToNotifications';
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  return {
    isLoading: query.isLoading,
    isSigningOut,
    profile: {
      fullName,
      location: worker?.locality || worker?.address_text || '',
      photoUri: mediaUrl(worker?.photo_url ?? account?.photo_url),
    },
    rating: worker
      ? { avg: worker.rating_avg, count: worker.rating_count }
      : undefined,
    initials: initialsOf(fullName),
    theme,
    languageLabel: language.label,
    openAppearance: () => navigation.navigate(ROUTES.appearance),
    openNotifications: navigateToNotifications,
    openEditProfile: () => navigation.navigate(ROUTES.editProfile),
    openPayouts: () => navigation.navigate(ROUTES.payoutAccount),
    openLanguage: () => navigation.navigate(ROUTES.language),
    openFaq: () => navigation.navigate(ROUTES.faq),
    openTerms: () => navigation.navigate(ROUTES.terms),
    signOut: async () => {
      if (isSigningOut) return;
      setIsSigningOut(true);
      try {
        await logoutAuthSession();
      } finally {
        setIsSigningOut(false);
      }
    },
  };
};
