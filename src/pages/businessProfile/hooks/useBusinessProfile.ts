import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { mediaUrl, meApi } from '@/services/api/meApi';
import { logoutAuthSession } from '@/services/auth';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { TabAppNavigation } from '@/types';
import { initialsOf } from '@/utils/format';

export const useBusinessProfile = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const query = useApiQuery(() => meApi.profile(), []);
  const business = query.data?.business;
  const theme = usePreferencesStore(state => state.theme);
  const language = usePreferencesStore(state => state.language);
  const businessName = business?.business_name ?? '';
  const location = business?.locality || business?.address_text || '';

  return {
    isLoading: query.isLoading,
    isVerified: business?.verification_status === 'verified',
    photoUri: mediaUrl(business?.logo_url),
    businessName,
    location,
    initials: initialsOf(businessName),
    theme,
    languageLabel: language.label,
    openLanguage: () => navigation.navigate(ROUTES.language),
    openAppearance: () => navigation.navigate(ROUTES.appearance),
    openFaq: () => navigation.navigate(ROUTES.faq),
    openTerms: () => navigation.navigate(ROUTES.terms),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openBusinessEditProfile: () =>
      navigation.navigate(ROUTES.businessEditProfile),
    openPaymentHistory: () =>
      navigation.navigate(ROUTES.businessPaymentHistory),
    signOut: logoutAuthSession,
  };
};
