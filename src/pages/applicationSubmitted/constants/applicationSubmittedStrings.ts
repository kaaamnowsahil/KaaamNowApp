import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`applicationSubmitted.${key}`, values);

export const APPLICATION_SUBMITTED_STRINGS = {
  get HEADER_TITLE() {
    return tr('workerFlow.shiftSecured.headerTitle');
  },
  get HEADER_TAG() {
    return tr('workerFlow.checkIn.headerRight');
  },
  overline: (ref: string) => k('overline', { ref }),
  get HEADING() {
    return k('heading');
  },
  subtitle: (business: string) => k('subtitle', { business }),
  get TRACK() {
    return k('track');
  },
  get BROWSE() {
    return k('browse');
  },
};
