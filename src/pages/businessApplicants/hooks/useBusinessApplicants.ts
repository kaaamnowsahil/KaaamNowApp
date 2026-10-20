import { useState } from 'react';

import type { ApplicantStatus } from '../mock';
import { BUSINESS_APPLICANTS } from '../mock';

export type ApplicantSort = 'recent' | 'rating' | 'experience';

export const useBusinessApplicants = () => {
    const [status, setStatus] = useState<ApplicantStatus>('applied');
    const [sort, setSort] = useState<ApplicantSort>('recent');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const applicants = BUSINESS_APPLICANTS
        .filter(applicant => applicant.status === status)
        .sort((left, right) => {
            if (sort === 'rating') return right.rating - left.rating;
            if (sort === 'experience') return right.experienceMonths - left.experienceMonths;
            return BUSINESS_APPLICANTS.indexOf(left) - BUSINESS_APPLICANTS.indexOf(right);
        });

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