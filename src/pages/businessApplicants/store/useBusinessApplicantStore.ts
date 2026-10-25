import { create } from 'zustand';

import type { BusinessApplicant, BusinessApplicantStatus } from '@/types';

type BusinessApplicantState = {
  applicants: BusinessApplicant[];
  upsert: (applicants: BusinessApplicant[]) => void;
  updateStatus: (applicantId: string, status: BusinessApplicantStatus) => void;
  remove: (applicantId: string) => void;
};

/** Lookup cache for applicants and roster members loaded from the API, so detail screens can find them by id. */
export const useBusinessApplicantStore = create<BusinessApplicantState>(
  set => ({
    applicants: [],
    upsert: incoming =>
      set(state => {
        const ids = new Set(incoming.map(applicant => applicant.id));
        return {
          applicants: [
            ...incoming,
            ...state.applicants.filter(applicant => !ids.has(applicant.id)),
          ],
        };
      }),
    updateStatus: (applicantId, status) =>
      set(state => ({
        applicants: state.applicants.map(applicant =>
          applicant.id === applicantId ? { ...applicant, status } : applicant,
        ),
      })),
    remove: applicantId =>
      set(state => ({
        applicants: state.applicants.filter(
          applicant => applicant.id !== applicantId,
        ),
      })),
  }),
);
