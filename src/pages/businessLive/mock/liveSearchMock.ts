import type { BusinessLiveWorker } from '@/types';

import { BUSINESS_APPLICANTS } from '@/pages/businessApplicants/mock/businessApplicantsMock';

export const BUSINESS_LIVE_SEARCH_MOCK = {
  windowSeconds: 30,
  initialRadiusKm: 3,
  maxRadiusKm: 5,
  acceptanceBatchSize: 2,
} as const;

const getMockSearchCandidates = (
  alreadyAccepted: BusinessLiveWorker[],
): BusinessLiveWorker[] => {
  const acceptedIds = new Set(alreadyAccepted.map(worker => worker.id));

  return BUSINESS_APPLICANTS.flatMap(applicant => {
    if (
      applicant.status !== 'confirmed' ||
      acceptedIds.has(applicant.id) ||
      applicant.distanceKm === undefined ||
      applicant.arrivalMinutes === undefined
    ) {
      return [];
    }
    return [{
      id: applicant.id,
      name: applicant.name,
      category: applicant.category,
      rating: applicant.rating,
      distanceKm: applicant.distanceKm,
      arrivalMinutes: applicant.arrivalMinutes,
    }];
  });
};

export const findMockAcceptedWorkers = (
  alreadyAccepted: BusinessLiveWorker[],
  openPositions: number,
): BusinessLiveWorker[] =>
  getMockSearchCandidates(alreadyAccepted).slice(
    0,
    Math.min(openPositions, BUSINESS_LIVE_SEARCH_MOCK.acceptanceBatchSize),
  );

export const getMockWorkersNotifiedCount = (): number =>
  BUSINESS_APPLICANTS.filter(applicant => applicant.status === 'confirmed')
    .length;
