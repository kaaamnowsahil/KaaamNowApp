import { tr } from '@/services/i18n/tr';
import type { ShiftStatus } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftCard.${key}`, values);

export const SHIFT_STRINGS = {
  STATUS_LABEL: {
    get live() {
      return k('statusLabel.live');
    },
    get scheduled() {
      return k('statusLabel.scheduled');
    },
  } as Record<ShiftStatus, string>,
  get VERIFIED() {
    return k('verified');
  },
  get PER_HOUR() {
    return k('perHour');
  },
  estimated: (amount: string) => k('estimated', { amount }),
  spotsOpen: (n: number) => k('spotsOpen', { count: n }),
  hours: (n: number) => k('hours', { count: n }),
  km: (n: number) => k('km', { n }),
};
