import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`businessShiftCreate.formErrors.${key}`, values);

export const SHIFT_FORM_ERRORS = {
  get DATES() {
    return k('dates');
  },
  get LOCATION() {
    return k('location');
  },
  get ROLE() {
    return k('role');
  },
  get CATEGORY() {
    return k('category');
  },
  get START() {
    return k('start');
  },
  get END() {
    return k('end');
  },
  get END_BEFORE_START() {
    return k('endBeforeStart');
  },
  tooSoon: (hours: number) => k('tooSoon', { hours }),
  get WORKERS() {
    return k('workers');
  },
  get PAY() {
    return k('pay');
  },
  get BREAK() {
    return k('break');
  },
  get RESPONSIBILITIES() {
    return k('responsibilities');
  },
};
