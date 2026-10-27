import { ROUTES } from '@/constants/routes';
import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`placeholder.${key}`, values);

/** Screen title + Figma frame each placeholder will be replaced with. */
export const PLACEHOLDER_SCREENS: Record<
  string,
  { title: string; figma: string }
> = {
  [ROUTES.businessLive]: {
    get title() {
      return k('screens.live');
    },
    figma: '1:2913 / 1:2991',
  },
  [ROUTES.businessShifts]: {
    get title() {
      return k('screens.shifts');
    },
    figma: '38:491 / 38:563',
  },
  [ROUTES.businessApplicants]: {
    get title() {
      return k('screens.applicants');
    },
    figma: '1:1277 / 1:1323',
  },
  [ROUTES.businessProfile]: {
    get title() {
      return k('screens.profile');
    },
    figma: '24:2 / 24:187',
  },
  [ROUTES.terms]: {
    get title() {
      return k('screens.terms');
    },
    figma: '17:341 / 17:857',
  },
  [ROUTES.faq]: {
    get title() {
      return k('screens.faq');
    },
    figma: '17:376 / 17:892',
  },
};

export const PLACEHOLDER_STRINGS = {
  pending: (figma: string) => k('pending', { figma }),
  get SIGN_OUT() {
    return k('signOut');
  },
};
