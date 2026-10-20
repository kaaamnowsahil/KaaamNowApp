import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useBusinessShiftStore } from '@/services/business/useBusinessShiftStore';
import i18n from '@/services/i18n/i18n';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { useBusinessApplicantStore } from '@/pages/businessApplicants/store/useBusinessApplicantStore';
import {
  BUSINESS_DASHBOARD,
  BUSINESS_ROSTER,
  createLiveDraftFromDashboardShift,
  findMockAcceptedWorkers,
} from '@/pages/businessLive/mock';
import { toBusinessDashboardShifts } from '@/pages/businessShiftCreate/utils';

export const useBusinessShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const draft = useBusinessShiftStore(state => state.draft);
  const postedShifts = useBusinessShiftStore(state => state.postedShifts);
  const activeRequest = useBusinessLiveStore(state => state.activeRequest);
  const publishRequest = useBusinessLiveStore(state => state.publishRequest);
  const acceptWorkers = useBusinessLiveStore(state => state.acceptWorkers);
  const confirmedCount = useBusinessApplicantStore(
    state =>
      state.applicants.filter(applicant => applicant.status === 'confirmed')
        .length,
  );

  const openLiveShift = (shift: (typeof BUSINESS_DASHBOARD.liveShifts)[number]) => {
    if (!activeRequest) {
      const request = publishRequest(createLiveDraftFromDashboardShift(shift));
      const mockWorkers = findMockAcceptedWorkers(
        [],
        Math.min(shift.confirmedCount ?? 0, request.workers),
      );
      acceptWorkers(mockWorkers);
      if (mockWorkers.length >= request.workers && mockWorkers[0]) {
        navigation.navigate(ROUTES.businessLiveAccepted);
      } else if (mockWorkers.length > 0) {
        navigation.navigate(ROUTES.businessLiveStaffing);
      } else {
        navigation.navigate(ROUTES.businessLiveFinding);
      }
      return;
    }

    if (activeRequest.acceptedWorkers.length >= activeRequest.workers) {
      if (activeRequest.acceptedWorkers[0]) {
        navigation.navigate(ROUTES.businessLiveAccepted);
      } else {
        navigation.navigate(ROUTES.businessLive);
      }
    } else if (activeRequest.acceptedWorkers.length > 0) {
      navigation.navigate(ROUTES.businessLiveStaffing);
    } else {
      navigation.navigate(ROUTES.businessLiveFinding);
    }
  };

  return {
    isLoading,
    liveShifts: activeRequest
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
      : BUSINESS_DASHBOARD.liveShifts,
    businessName: BUSINESS_DASHBOARD.businessName,
    isVerified: BUSINESS_DASHBOARD.isVerified,
    roster: {
      staffedCount: confirmedCount,
      totalCount: Math.max(BUSINESS_ROSTER.totalCount, confirmedCount),
    },
    openApplicants: () => navigation.navigate(ROUTES.businessApplicants),
    openLiveShift,
    openRoster: () => navigation.navigate(ROUTES.businessRoster),
    openSchedule: () => navigation.navigate(ROUTES.businessShiftSchedule),
    resumeDraft: () => {
      if (draft) {
        navigation.navigate(ROUTES.businessShiftSchedule, { draft });
      }
    },
    draft,
    scheduledShifts: [
      ...BUSINESS_DASHBOARD.scheduledShifts,
      ...postedShifts.flatMap(shift =>
        toBusinessDashboardShifts(shift, i18n.language),
      ),
    ],
  };
};
