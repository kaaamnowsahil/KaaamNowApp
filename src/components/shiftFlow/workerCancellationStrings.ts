import { tr } from '@/services/i18n/tr';
import type { CancellationTier } from '@/services/shifts/shiftsApi';
import { formatRupees } from '@/utils/format';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`workerCancellation.${key}`, values);

const money = (minor: number) => formatRupees(Math.round(minor / 100));

const strikeLabel = (weight: number) =>
  weight === 0.5 ? k('halfStrike') : k('strike', { count: weight });

/** Worker-side cancellation copy (marketplace rules §5). Same text on web. */
export const WORKER_CANCELLATION_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get INTRO() {
    return k('intro');
  },
  get BOOKING_NOTE() {
    return k('bookingNote');
  },
  get NO_SHOW() {
    return k('noShow');
  },
  get FREE() {
    return k('free');
  },
  get LOAD_FAILED() {
    return k('loadFailed');
  },
  get WALLET() {
    return k('wallet');
  },
  get TERMS_AGREE() {
    return k('termsAgree');
  },
  get READ_TERMS() {
    return k('readTerms');
  },
  get BOOK_SHEET_TITLE() {
    return k('bookSheetTitle');
  },
  get BOOK_SHEET_BODY() {
    return k('bookSheetBody');
  },
  get BOOK_SHEET_ACCEPT() {
    return k('bookSheetAccept');
  },
  get BOOK_SHEET_READ() {
    return k('bookSheetRead');
  },
  tierWindow: (from: number, to: number | null) => {
    if (to == null) return k('tierMoreThan', { from });
    if (from === 0) return k('tierLessThan', { to });
    return k('tierBetween', { from, to });
  },
  tierFee: (tier: CancellationTier) => {
    const pct = tier.fee_cap_minor
      ? k('pctOfPayCapped', {
          pct: tier.booking_pct,
          cap: money(tier.fee_cap_minor),
        })
      : k('pctOfPay', { pct: tier.booking_pct });
    const parts = [
      tier.flat_fee_minor > 0 ? money(tier.flat_fee_minor) : '',
      tier.booking_pct > 0 ? pct : '',
    ].filter(Boolean);
    const fee = parts.length ? parts.join(' + ') : k('free');
    return tier.strike_weight > 0
      ? `${fee} + ${strikeLabel(tier.strike_weight)}`
      : fee;
  },
  strike: strikeLabel,
  strikes: (
    limit: number,
    windowDays: number,
    limitDays: number,
    ban: number,
  ) => k('strikes', { limit, windowDays, limitDays, ban }),
};
