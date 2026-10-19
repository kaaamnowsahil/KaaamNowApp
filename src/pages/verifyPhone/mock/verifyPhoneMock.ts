import type { UserRole } from '@/services/onboarding/useOnboardingStore';

/** Demo sign-in accounts, keyed by E.164 phone. */
export const DEMO_ACCOUNTS: Record<string, UserRole> = {
  '+918557062835': 'worker',
  '+919973248958': 'business',
};
