import { tr } from '@/services/i18n/tr';

const k = (key: string) => tr(`shiftList.${key}`);

export const SHIFT_LIST_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get SUBTITLE() {
    return k('subtitle');
  },
  get EMPTY_TITLE() {
    return k('emptyTitle');
  },
  get EMPTY_BODY() {
    return k('emptyBody');
  },
  get ERROR_TITLE() {
    return k('errorTitle');
  },
  get RETRY() {
    return k('retry');
  },
};
