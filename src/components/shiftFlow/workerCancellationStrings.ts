import type { CancellationTier } from '@/services/shifts/shiftsApi';
import { formatRupees } from '@/utils/format';

const money = (minor: number) => formatRupees(Math.round(minor / 100));

const strikeLabel = (weight: number) =>
  weight === 0.5 ? '½ strike' : `${weight} ${weight === 1 ? 'strike' : 'strikes'}`;

/** Worker-side cancellation copy (marketplace rules §5). Same text on web. */
export const WORKER_CANCELLATION_STRINGS = {
  TITLE: 'Cancellation policy',
  INTRO:
    'If you cancel after booking, a fee applies based on how long before the start you cancel.',
  BOOKING_NOTE:
    'Booking is instant. Your place is confirmed as soon as you book; no approval is needed.',
  NO_SHOW: 'No-show (no cancel, no message)',
  FREE: 'Free',
  LOAD_FAILED: 'Couldn’t load the cancellation policy',
  WALLET:
    'Fees are taken from your wallet. If it goes negative, the amount is recovered from your next earnings, and you can keep booking.',
  TERMS_AGREE: 'By booking, you agree to the cancellation policy and the Worker terms.',
  READ_TERMS: 'Read full terms',
  BOOK_SHEET_TITLE: 'Book this shift',
  BOOK_SHEET_BODY:
    'Booking is instant. By booking, you agree to the cancellation policy and the Worker terms & conditions.',
  BOOK_SHEET_ACCEPT: 'Agree & book',
  BOOK_SHEET_READ: 'Read terms & conditions',
  tierWindow: (from: number, to: number | null) => {
    if (to == null) return `More than ${from}h before start`;
    if (from === 0) return `Less than ${to}h before start`;
    return `${to}h – ${from}h before start`;
  },
  tierFee: (tier: CancellationTier) => {
    const parts = [
      tier.flat_fee_minor > 0 ? money(tier.flat_fee_minor) : '',
      tier.booking_pct > 0
        ? `${tier.booking_pct}% of your pay${
          tier.fee_cap_minor ? ` (max ${money(tier.fee_cap_minor)})` : ''
        }`
        : '',
    ].filter(Boolean);
    const fee = parts.length ? parts.join(' + ') : 'Free';
    return tier.strike_weight > 0 ? `${fee} + ${strikeLabel(tier.strike_weight)}` : fee;
  },
  strikes: (limit: number, windowDays: number, limitDays: number, ban: number) =>
    `${limit} strikes within ${windowDays} days means fewer shifts are shown to you for ${limitDays} days; ${ban} strikes means an account ban.`,
} as const;
