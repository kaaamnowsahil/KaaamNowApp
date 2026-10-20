import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { BUSINESS_DASHBOARD, BUSINESS_ROSTER } from '@/pages/businessLive/mock';

export const useBusinessShifts = () => {
    const navigation = useNavigation<TabAppNavigation>();
    const isLoading = useMockLoading();

    return {
        isLoading,
        liveShifts: BUSINESS_DASHBOARD.liveShifts,
        businessName: BUSINESS_DASHBOARD.businessName,
        isVerified: BUSINESS_DASHBOARD.isVerified,
        roster: BUSINESS_ROSTER,
        openApplicants: () => navigation.navigate(ROUTES.businessApplicants),
        scheduledShifts: BUSINESS_DASHBOARD.scheduledShifts,
    };
};