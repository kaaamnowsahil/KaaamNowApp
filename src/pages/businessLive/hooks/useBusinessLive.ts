import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { toDashboardShift } from '@/services/shifts/shiftMappers';
import type { BusinessShiftItem } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import type { TabAppNavigation } from '@/types';

export type BusinessView = 'live' | 'scheduled';

const DASHBOARD_PREVIEW_COUNT = 2;

export const useBusinessLive = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const data = useBusinessShiftsData();
  const [view, setView] = useState<BusinessView>('live');
  const items = view === 'live' ? data.liveShifts : data.scheduledShifts;
  const sum = (
    list: BusinessShiftItem[],
    pick: (item: BusinessShiftItem) => number,
  ) => list.reduce((total, item) => total + pick(item), 0);

  return {
    isLoading: data.isLoading,
    error: data.error,
    reload: data.reload,
    businessName: data.businessName,
    isVerified: data.isVerified,
    location: data.location,
    liveConfirmed: sum(data.liveShifts, item => item.booked_count),
    liveTotal: sum(data.liveShifts, item => item.workers_required),
    newApplicants: sum(
      [...data.liveShifts, ...data.scheduledShifts],
      item => item.pending_applications,
    ),
    view,
    setView,
    shifts: items
      .slice(0, DASHBOARD_PREVIEW_COUNT)
      .map(item => ({ item, card: toDashboardShift(item) })),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openShifts: () => navigation.navigate(ROUTES.businessShifts),
    openRoster: (item: BusinessShiftItem) =>
      navigation.navigate(ROUTES.businessRoster, { shiftId: item.id }),
    openSchedule: () => navigation.navigate(ROUTES.businessShiftSchedule),
  };
};
