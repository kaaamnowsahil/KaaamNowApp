import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useBusinessShiftStore } from '@/services/business/useBusinessShiftStore';
import i18n from '@/services/i18n/i18n';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { toBusinessDashboardShifts } from '@/pages/businessShiftCreate/utils';
import {
  BUSINESS_DASHBOARD,
  createLiveDraftFromDashboardShift,
  findMockAcceptedWorkers,
} from '../mock';

export type BusinessView = 'live' | 'scheduled';

export const useBusinessLive = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const postedShifts = useBusinessShiftStore(state => state.postedShifts);
  const activeRequest = useBusinessLiveStore(state => state.activeRequest);
  const publishRequest = useBusinessLiveStore(state => state.publishRequest);
  const acceptWorkers = useBusinessLiveStore(state => state.acceptWorkers);
  const [view, setView] = useState<BusinessView>('live');
  const [location, setLocation] = useState(BUSINESS_DASHBOARD.location);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const liveShifts = activeRequest
    ? [
        {
          id: activeRequest.id,
          title: activeRequest.role,
          date: i18n.t('businessLiveCreate.today'),
          time: i18n.t('businessLiveCreate.liveNow'),
          hours: activeRequest.hours,
          area: activeRequest.location,
          requirement: activeRequest.requirement,
          distanceKm: activeRequest.searchRadiusKm,
          hourlyRate: activeRequest.hourlyRate,
          estimatedTotal:
            activeRequest.hourlyRate *
              activeRequest.hours *
              activeRequest.workers +
            Math.round(
              activeRequest.hourlyRate *
                activeRequest.hours *
                activeRequest.workers *
                0.05,
            ),
          confirmedCount: activeRequest.acceptedWorkers.length,
          totalSpots: activeRequest.workers,
        },
      ]
    : BUSINESS_DASHBOARD.liveShifts;
  const shifts =
    view === 'live'
      ? liveShifts
      : [
          ...BUSINESS_DASHBOARD.scheduledShifts,
          ...postedShifts.flatMap(shift =>
            toBusinessDashboardShifts(shift, i18n.language),
          ),
        ];

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
    activeRequest,
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openShifts: () => navigation.navigate(ROUTES.businessShifts),
    openPostedLiveRequest: (shift = liveShifts[0]) => {
      if (!activeRequest) {
        if (!shift) return;
        const request = publishRequest(
          createLiveDraftFromDashboardShift(shift),
        );
        const mockWorkers = findMockAcceptedWorkers(
          [],
          Math.min(shift.confirmedCount ?? 0, request.workers),
        );
        acceptWorkers(mockWorkers);
        const [firstAcceptedWorker] = mockWorkers;
        if (mockWorkers.length >= request.workers && firstAcceptedWorker) {
          navigation.navigate(ROUTES.businessLiveAccepted);
        } else if (mockWorkers.length > 0) {
          navigation.navigate(ROUTES.businessLiveStaffing);
        } else {
          navigation.navigate(ROUTES.businessLiveFinding);
        }
        return;
      }
      const [firstAcceptedWorker] = activeRequest.acceptedWorkers;
      if (activeRequest.acceptedWorkers.length >= activeRequest.workers) {
        if (firstAcceptedWorker) {
          navigation.navigate(ROUTES.businessLiveAccepted);
          return;
        }
        navigation.navigate(ROUTES.businessLive);
        return;
      }
      if (activeRequest.acceptedWorkers.length > 0) {
        navigation.navigate(ROUTES.businessLiveStaffing);
      } else {
        navigation.navigate(ROUTES.businessLiveFinding);
      }
    },
    openLiveCreate: () => navigation.navigate(ROUTES.businessLiveCreate),
    openSchedule: () => navigation.navigate(ROUTES.businessShiftSchedule),
  };
};
