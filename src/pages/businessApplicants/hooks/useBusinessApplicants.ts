import { useMemo, useState } from 'react';

import { useBusinessApplicantStore } from '../store/useBusinessApplicantStore';
import type { ApplicantStatus } from '../mock';

export type ApplicantSort = 'recent' | 'rating' | 'experience';

export const useBusinessApplicants = (initialStatus: ApplicantStatus = 'applied') => {
    const [status, setStatus] = useState<ApplicantStatus>(initialStatus);
    const [sort, setSort] = useState<ApplicantSort>('recent');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const allApplicants = useBusinessApplicantStore(state => state.applicants);

    const applicants = useMemo(
        () =>
            allApplicants
                .filter(applicant => applicant.status === status)
                .sort((left, right) => {
                    if (sort === 'rating') return right.rating - left.rating;
                    if (sort === 'experience')
                        return right.experienceMonths - left.experienceMonths;
                    return allApplicants.indexOf(left) - allApplicants.indexOf(right);
                }),
        [allApplicants, sort, status],
    );

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
    };
};
