import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`rateBusiness.${key}`, values);

const RATING_LABEL_KEYS = [
  'tapToRate',
  'poor',
  'couldBeBetter',
  'good',
  'great',
  'excellent',
];

export const RATE_BUSINESS_STRINGS = {
  heading: (business: string) => k('heading', { business }),
  get SUBTITLE() {
    return k('subtitle');
  },
  businessMeta: (verified: boolean, role: string) =>
    verified ? k('businessMetaVerified', { role }) : role,
  starLabel: (n: number) => k('starLabel', { count: n }),
  get RATING_LABEL() {
    return RATING_LABEL_KEYS.map(key => k(`ratingLabel.${key}`));
  },
  get WENT_WELL() {
    return k('wentWell');
  },
  get COMMENT_PLACEHOLDER() {
    return k('commentPlaceholder');
  },
  get SUBMIT() {
    return k('submit');
  },
  get SKIP() {
    return k('skip');
  },
  get SUBMIT_FAILED() {
    return k('submitFailed');
  },
};
