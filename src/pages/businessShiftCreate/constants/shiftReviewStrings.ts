import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftReview.${key}`, values);

export const SHIFT_REVIEW_STRINGS = {
  get WORKERS_PAY() {
    return k('workersPay');
  },
  gatewayFee: (pct: number) => k('gatewayFee', { pct }),
  platformCommission: (pct: number) => k('platformCommission', { pct }),
  taxLine: (label: string, pct: number) => k('taxLine', { label, pct }),
  promoDiscount: (code: string) =>
    k('promoDiscount', { code: code.toUpperCase() }),
  get SHIFT_TOTAL() {
    return k('shiftTotal');
  },
  get ESTIMATED_TOTAL() {
    return k('estimatedTotal');
  },
  get DEPOSIT_NOTE() {
    return k('depositNote');
  },
  get ESTIMATE_FAILED() {
    return k('estimateFailed');
  },
  payAndPost: (amount: string) => k('payAndPost', { amount }),
  get POST_FAILED() {
    return k('postFailed');
  },
  get CANCELLATION_TITLE() {
    return k('cancellationTitle');
  },
  get CANCELLATION_INTRO() {
    return k('cancellationIntro');
  },
  tierWindow: (from: number, to: number | null) => {
    if (to == null) return k('tierMoreThan', { from });
    if (from === 0) return k('tierLessThan', { to });
    return k('tierBetween', { from, to });
  },
  get TIER_FREE() {
    return k('tierFree');
  },
  tierFee: (pct: number) => k('tierFee', { pct }),
  get CANCELLATION_FREE_UNBOOKED() {
    return k('cancellationFreeUnbooked');
  },
  get CANCELLATION_GATEWAY() {
    return k('cancellationGateway');
  },
  unfilledSeats: (hours: number, days: number) =>
    k('unfilledSeats', { hours, days }),
  workerCancelVoucher: (hours: number, days: number) =>
    k('workerCancelVoucher', { hours, days }),
  get CANCELLATION_LOAD_FAILED() {
    return k('cancellationLoadFailed');
  },
  get TERMS_AGREE() {
    return k('termsAgree');
  },
  get READ_TERMS() {
    return k('readTerms');
  },
};
