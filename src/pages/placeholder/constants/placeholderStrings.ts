import { ROUTES } from '@/constants/routes';

/** Screen title + Figma frame each placeholder will be replaced with. */
export const PLACEHOLDER_SCREENS: Record<
  string,
  { title: string; figma: string }
> = {
  [ROUTES.businessLive]: { title: 'Live now', figma: '1:2913 / 1:2991' },
  [ROUTES.businessShifts]: { title: 'Shifts', figma: '38:491 / 38:563' },
  [ROUTES.businessApplicants]: {
    title: 'Applicants',
    figma: '1:1277 / 1:1323',
  },
  [ROUTES.businessProfile]: { title: 'Profile', figma: '24:2 / 24:187' },
  [ROUTES.terms]: { title: 'Terms of service', figma: '17:341 / 17:857' },
  [ROUTES.faq]: { title: 'FAQ', figma: '17:376 / 17:892' },
};

export const PLACEHOLDER_STRINGS = {
  pending: (figma: string) => `Screen coming next from Figma (${figma}).`,
  SIGN_OUT: 'Sign out',
} as const;
