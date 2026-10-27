import { tr } from '@/services/i18n/tr';
import type { BookingStatus } from '@/types';

/** Same order and keys as the web My shifts sections. */
export type ShiftsSection =
  | 'live'
  | 'inProgress'
  | 'today'
  | 'confirm'
  | 'upcoming'
  | 'past'
  | 'waiting'
  | 'declinedByBusiness'
  | 'declinedByYou';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`workerShifts.${key}`, values);

export const WORKER_SHIFTS_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get SUBTITLE() {
    return k('subtitle');
  },
  SECTION_TITLE: {
    get live() {
      return k('sections.live');
    },
    get inProgress() {
      return k('sections.inProgress');
    },
    get today() {
      return k('sections.today');
    },
    get confirm() {
      return k('sections.confirm');
    },
    get upcoming() {
      return k('sections.upcoming');
    },
    get past() {
      return k('sections.past');
    },
    get waiting() {
      return k('sections.waiting');
    },
    get declinedByBusiness() {
      return k('sections.declinedByBusiness');
    },
    get declinedByYou() {
      return k('sections.declinedByYou');
    },
  } as Record<ShiftsSection, string>,
  status: (status: BookingStatus, code?: string) =>
    status === 'confirmed' && code
      ? k('status.confirmedCode', { code })
      : k(`status.${status}`),
  verified: (business: string) => k('verified', { business }),
  when: (date: string, time: string, hours: number) =>
    k('whenHours', { date, time, count: hours }),
  where: (area: string, km: number) => k('where', { area, km }),
  get PER_HOUR() {
    return k('perHourSuffix');
  },
  estimated: (amount: string) => k('estimated', { amount }),
  offerPay: (rate: string, total: string) => k('offerPay', { rate, total }),
  confirmBy: (when: string) => k('confirmBy', { when }),
  ACTION: {
    get confirmed() {
      return k('actions.viewMyShift');
    },
    get selected() {
      return k('actions.selected');
    },
    get applied() {
      return k('actions.applied');
    },
    get completed() {
      return k('actions.viewDetailsShort');
    },
    get cancelled() {
      return k('actions.viewDetailsShort');
    },
  } as Record<BookingStatus, string>,
  get EMPTY_TITLE() {
    return k('emptyTitle');
  },
  get EMPTY_BODY() {
    return k('emptyBody');
  },
  get EMPTY_ACTION() {
    return k('emptyAction');
  },
  get LOAD_ERROR_TITLE() {
    return k('loadErrorTitle');
  },
  get RETRY() {
    return k('retry');
  },
  get UPDATE_FAILED() {
    return k('updateFailed');
  },
};
