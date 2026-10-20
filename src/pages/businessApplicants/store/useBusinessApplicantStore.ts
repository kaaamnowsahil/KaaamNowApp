import { create } from 'zustand';

import type { ApplicantStatus, BusinessApplicant } from '../mock';
import { BUSINESS_APPLICANTS } from '../mock';

type BusinessApplicantState = {
    applicants: BusinessApplicant[];
    updateStatus: (applicantId: string, status: ApplicantStatus) => void;
};

export const useBusinessApplicantStore = create<BusinessApplicantState>(set => ({
    applicants: BUSINESS_APPLICANTS,
    updateStatus: (applicantId, status) =>
        set(state => ({
            applicants: state.applicants.map(applicant =>
                applicant.id === applicantId
                    ? {
                          ...applicant,
                          status,
                          confirmedAt:
                              status === 'confirmed'
                                  ? new Date().toLocaleString(undefined, {
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        month: 'short',
                                    })
                                  : applicant.confirmedAt,
                      }
                    : applicant,
            ),
        })),
}));
