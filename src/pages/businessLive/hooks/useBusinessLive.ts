import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { toDashboardShift } from '@/services/shifts/shiftMappers';
import type { BusinessShiftItem } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import type { TabAppNavigation } from '@/types';

export type BusinessView = 'live' | 'scheduled';

const DASHBOARD_PREVIEW_COUNT = 2;
const DASHBOARD_REFRESH_MS = 5 * 60 * 1000;

export const useBusinessLive = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const data = useBusinessShiftsData({ pollIntervalMs: DASHBOARD_REFRESH_MS });
  const [view, setViewState] = useState<BusinessView>('live');
  const setView = (next: BusinessView) => {
    setViewState(next);
    data.reload();
  };
  const items = view === 'live' ? data.liveShifts : data.scheduledShifts;
  const sum = (
    list: BusinessShiftItem[],
    pick: (item: BusinessShiftItem) => number,
  ) => list.reduce((total, item) => total + pick(item), 0);

  return {
    isLoading: data.isLoading,
    isRefreshing: data.isRefreshing,
    error: data.error,
    reload: data.reload,
    businessName: data.businessName,
    isVerified: data.isVerified,
    location: data.location,
    confirmedWorkers: sum(items, item => item.booked_count),
    workersRequired: sum(items, item => item.workers_required),
    newApplicants: sum(items, item => item.pending_applications),
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
