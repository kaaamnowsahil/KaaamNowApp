import type { LedgerEntryType } from '@/services/earnings/earningsApi';
import { tr } from '@/services/i18n/tr';
import type { PayoutStatus } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`workerEarnings.${key}`, values);

export const WORKER_EARNINGS_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get HEADER_TAG() {
    return k('headerTag');
  },
  get OVERLINE() {
    return k('overline');
  },
  get HEADING() {
    return k('heading');
  },
  get PENDING() {
    return k('pending');
  },
  get PROCESSING() {
    return k('processing');
  },
  STATUS: {
    get pending() {
      return k('status.pending');
    },
    get processing() {
      return k('status.processing');
    },
    get completed() {
      return k('status.completed');
    },
    get failed() {
      return k('status.failed');
    },
  } as Record<PayoutStatus, string>,
  /** "4 h × ₹150 = ₹600" */
  shiftMeta: (hours: number, rate: string, total: string) =>
    k('shiftMeta', { hours, rate, total }),
  /** "6 × ₹600 = ₹3,600" */
  groupMeta: (shifts: number, each: string, total: string) =>
    `${shifts} × ${each} = ${total}`,
  get WITHDRAW() {
    return k('withdraw');
  },
  get VIEW_ALL() {
    return k('viewAll');
  },
  get SUPPORT() {
    return k('support');
  },
  get AVAILABLE() {
    return k('available');
  },
  thisMonth: (amount: string, shifts: number) =>
    k('thisMonth', { amount, count: shifts }),
  get EMPTY() {
    return k('empty');
  },
  ENTRY_TYPE: {
    get shift_earning() {
      return k('entryType.shift_earning');
    },
    get withdrawal() {
      return k('entryType.withdrawal');
    },
    get withdrawal_reversal() {
      return k('entryType.withdrawal_reversal');
    },
    get commission() {
      return k('entryType.commission');
    },
    get cancellation_fee() {
      return k('entryType.cancellation_fee');
    },
    get cancellation_compensation() {
      return k('entryType.cancellation_compensation');
    },
    get adjustment() {
      return k('entryType.adjustment');
    },
    get promo_credit() {
      return k('entryType.promo_credit');
    },
    get fee_waiver() {
      return k('entryType.fee_waiver');
    },
  } as Record<LedgerEntryType, string>,
  duesTitle: (amount: string) => k('duesTitle', { amount }),
  get DUES_BODY() {
    return k('duesBody');
  },
  get RELIABILITY() {
    return k('reliability');
  },
  strikes: (count: number, ban: number) =>
    k('strikes', { strikes: count, ban }),
  strikesBody: (days: number, limit: number) =>
    k('strikesBody', { days, limit }),
  limitedUntil: (date: string) => k('limitedUntil', { date }),
  get ON_HOLD() {
    return k('onHold');
  },
  get PROMO_LABEL() {
    return k('promoLabel');
  },
  get PROMO_PLACEHOLDER() {
    return k('promoPlaceholder');
  },
  get PROMO_REDEEM() {
    return k('promoRedeem');
  },
  promoPending: (code: string) =>
    k('promoPending', { code: code.toUpperCase() }),
  get PROMO_DONE() {
    return k('promoDone');
  },
  get PROMO_FAILED() {
    return k('promoFailed');
  },
};
