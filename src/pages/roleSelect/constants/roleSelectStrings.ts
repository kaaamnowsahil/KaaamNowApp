import type { UserRole } from '@/services/onboarding/useOnboardingStore';

/** UI strings for the Role select module (Figma 1:187 / 1:221). */
export const ROLE_SELECT_STRINGS = {
  TITLE: 'How will you use KaamNow?',
  SUBTITLE: 'Choose a starting mode. You can add the other role later.',
  CONTINUE: 'Continue',
  BACK: 'Back',
} as const;

export const ROLE_OPTIONS: {
  role: UserRole;
  title: string;
  caption: string;
}[] = [
  {
    role: 'worker',
    title: 'Worker',
    caption: 'Discover shifts, apply and earn.',
  },
  {
    role: 'business',
    title: 'Business',
    caption: 'Post shifts and manage a reliable team.',
  },
];
