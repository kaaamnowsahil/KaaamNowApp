import { useMemo, useState } from 'react';

import { toApplicant } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { BusinessApplicantStatus } from '@/types';

import { useBusinessApplicantStore } from '../store/useBusinessApplicantStore';

export type ApplicantSort = 'recent' | 'rating' | 'experience';

export const useBusinessApplicants = (
  initialStatus: BusinessApplicantStatus = 'applied',
) => {
  const [status, setStatus] = useState<BusinessApplicantStatus>(initialStatus);
  const [sort, setSort] = useState<ApplicantSort>('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const upsert = useBusinessApplicantStore(state => state.upsert);
  const query = useApiQuery(async () => {
    const page = await shiftsApi.applications(status);
    const items = page.items.map(toApplicant);
    upsert(items);
    return items;
  }, [status]);

  const applicants = useMemo(() => {
    const items = query.data ?? [];
    return [...items].sort((left, right) => {
      if (sort === 'rating') return right.rating - left.rating;
      if (sort === 'experience')
        return right.experienceMonths - left.experienceMonths;
      return items.indexOf(left) - items.indexOf(right);
    });
  }, [query.data, sort]);

  return {
    status,
    setStatus,
    sort,
    setSort,
    isSortOpen,
    openSort: () => setIsSortOpen(true),
    closeSort: () => setIsSortOpen(false),
    applicants,
    activeApplicant: applicants[0],
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
  };
};
