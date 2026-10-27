import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`terms.${key}`, values);

export const TERMS_STRINGS = {
  get TITLE() {
    return k('title');
  },
  lastUpdated: (date: string) => k('lastUpdated', { date }),
  get EMPTY() {
    return k('empty');
  },
  get LOAD_ERROR() {
    return k('loadError');
  },
};
