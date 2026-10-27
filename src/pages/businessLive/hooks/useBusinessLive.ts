import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import type { BusinessShiftItem } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import type { TabAppNavigation } from '@/types';

export type BusinessView = 'live' | 'scheduled';

const DASHBOARD_PREVIEW_COUNT = 2;
/** Same "Upcoming shifts" group as the web dashboard. */
const UPCOMING = new Set(['searching', 'open', 'filled']);
const DASHBOARD_REFRESH_MS = 5 * 60 * 1000;

export const useBusinessLive = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const data = useBusinessShiftsData({ pollIntervalMs: DASHBOARD_REFRESH_MS });
  const [view, setViewState] = useState<BusinessView>('live');
  const setView = (next: BusinessView) => {
    setViewState(next);
    data.reload();
  };
  const items = (view === 'live' ? data.liveShifts : data.scheduledShifts)
    .filter(item => UPCOMING.has(item.status))
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))
    .slice(0, DASHBOARD_PREVIEW_COUNT);
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
    shifts: items,
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openShifts: () => navigation.navigate(ROUTES.businessShifts),
    openLive: (item: BusinessShiftItem) =>
      navigation.navigate(ROUTES.businessLiveWork, { bookingId: item.id }),
    openBooked: (item: BusinessShiftItem) =>
      navigation.navigate(ROUTES.businessRoster, { shiftId: item.id }),
    openApplicants: () => navigation.navigate(ROUTES.businessApplicants),
    openSchedule: () =>
      navigation.navigate(
        view === 'live'
          ? ROUTES.businessLiveWorkPost
          : ROUTES.businessShiftSchedule,
      ),
  };
};
