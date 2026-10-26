import { useMemo, useState } from 'react';

import { toApplicant } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { BusinessApplicant, BusinessApplicantStatus } from '@/types';

import { useBusinessApplicantStore } from '../store/useBusinessApplicantStore';

export type ApplicantSort = 'time' | 'nearest' | 'pay' | 'recent' | 'rating' | 'experience';
/** 'all' or one shift id. */
export type ApplicantShiftFilter = string;

export const useBusinessApplicants = (
  initialStatus: BusinessApplicantStatus = 'applied',
) => {
  const [status, setStatus] = useState<BusinessApplicantStatus>(initialStatus);
  const [sort, setSort] = useState<ApplicantSort>('time');
  const [shiftId, setShiftId] = useState<ApplicantShiftFilter>('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const upsert = useBusinessApplicantStore(state => state.upsert);
  const query = useApiQuery(async () => {
    const [page, withdrawn] = await Promise.all([
      shiftsApi.applications(status),
      status === 'confirmed' ? shiftsApi.applications('withdrawn') : null,
    ]);
    const items = page.items.map(toApplicant);
    upsert(items);
    return { items, withdrawn: withdrawn?.items.map(toApplicant) ?? [] };
  }, [status]);

  const sorted = useMemo(
    () => (items: BusinessApplicant[]) =>
      [...items].sort((left, right) => {
        if (sort === 'nearest')
          return (left.distanceKm ?? Infinity) - (right.distanceKm ?? Infinity);
        if (sort === 'rating') return right.rating - left.rating;
        if (sort === 'experience')
          return right.experienceMonths - left.experienceMonths;
        return items.indexOf(left) - items.indexOf(right);
      }),
    [sort],
  );
  const applicants = useMemo(() => sorted(query.data?.items ?? []), [query.data, sorted]);
  const withdrawn = useMemo(() => sorted(query.data?.withdrawn ?? []), [query.data, sorted]);

  return {
    status,
    setStatus,
    sort,
    setSort,
    shiftId,
    setShiftId,
    isSortOpen,
    openSort: () => setIsSortOpen(true),
    closeSort: () => setIsSortOpen(false),
    applicants,
    /** Workers who withdrew or declined; only loaded for the confirmed list. */
    withdrawn,
    activeApplicant: applicants[0],
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
  };
};
