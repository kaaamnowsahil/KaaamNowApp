import { apiRequest } from '@/services/api/apiClient';

export type TermsAudience = 'worker' | 'business';

export type TermsStatus = {
  audience: TermsAudience;
  version: string | null;
  accepted: boolean;
  accepted_at?: string | null;
};

/** Applying needs `worker` terms accepted, posting needs `business`. */
export const termsApi = {
  status: (audience: TermsAudience) =>
    apiRequest<TermsStatus>('GET', '/me/terms', { query: { audience } }),
  accept: (audience: TermsAudience) =>
    apiRequest<TermsStatus>('POST', '/me/terms/accept', { body: { audience } }),
};
