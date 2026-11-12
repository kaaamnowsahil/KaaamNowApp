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

export const useBusinessProfile = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const query = useApiQuery(() => meApi.profile(), []);
  const business = query.data?.business;
  const theme = usePreferencesStore(state => state.theme);
  const language = usePreferencesStore(state => state.language);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const businessName = business?.business_name ?? '';
  const location = business?.locality || business?.address_text || '';

  return {
    isLoading: query.isLoading,
    isSigningOut,
    isVerified: business?.verification_status === 'verified',
    photoUri: mediaUrl(business?.logo_url),
    businessName,
    location,
    initials: initialsOf(businessName),
    rating: business
      ? { avg: business.rating_avg, count: business.rating_count }
      : undefined,
    theme,
    languageLabel: language.label,
    openLanguage: () => navigation.navigate(ROUTES.language),
    openAppearance: () => navigation.navigate(ROUTES.appearance),
    openFaq: () => navigation.navigate(ROUTES.faq),
    openTerms: () => navigation.navigate(ROUTES.terms),
    openNotifications: navigateToNotifications,
    openBusinessEditProfile: () =>
      navigation.navigate(ROUTES.businessEditProfile),
    openPaymentHistory: () =>
      navigation.navigate(ROUTES.businessPaymentHistory),
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
