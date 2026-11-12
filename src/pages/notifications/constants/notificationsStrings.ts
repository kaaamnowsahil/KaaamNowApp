import { tr } from '@/services/i18n/tr';

const k = (key: string) => tr(`notifications.${key}`);

export const NOTIFICATIONS_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get EMPTY() {
    return k('caughtUp');
  },
};
