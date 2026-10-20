import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';
import { initialsOf } from '@/utils/format';

import { BUSINESS_DASHBOARD } from '@/pages/businessLive/mock';

export const useBusinessProfile = () => {
    const navigation = useNavigation<TabAppNavigation>();
    const business = useOnboardingStore(state => state.business);
    const signOut = useAuthStore(state => state.signOut);
    const theme = usePreferencesStore(state => state.theme);
    const language = usePreferencesStore(state => state.language);
    const isLoading = useMockLoading();
    const businessName = business?.businessName ?? BUSINESS_DASHBOARD.businessName;
    const location = business?.address ?? BUSINESS_DASHBOARD.location;

    return {
        isLoading,
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
        openBusinessEditProfile: () => navigation.navigate(ROUTES.businessEditProfile),
        openPaymentHistory: () => navigation.navigate(ROUTES.businessPaymentHistory),
        signOut,
    };
};