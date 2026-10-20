import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { BUSINESS_DASHBOARD } from '../mock';

export type BusinessView = 'live' | 'scheduled';

export const useBusinessLive = () => {
    const navigation = useNavigation<TabAppNavigation>();
    const isLoading = useMockLoading();
    const [view, setView] = useState<BusinessView>('live');
    const [location, setLocation] = useState(BUSINESS_DASHBOARD.location);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const shifts =
        view === 'live'
            ? BUSINESS_DASHBOARD.liveShifts
            : BUSINESS_DASHBOARD.scheduledShifts;

    return {
        isLoading,
        view,
        setView,
        location,
        selectLocation: (nextLocation: string) => {
            setLocation(nextLocation);
            setIsLocationOpen(false);
        },
        isLocationOpen,
        toggleLocation: () => setIsLocationOpen(open => !open),
        shifts,
        openNotifications: () => navigation.navigate(ROUTES.notifications),
        openShifts: () => navigation.navigate(ROUTES.businessShifts),
    };
};