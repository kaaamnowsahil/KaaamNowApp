import type { LedgerEntryType } from '@/services/earnings/earningsApi';
import type { PayoutStatus } from '@/types';

export const WORKER_EARNINGS_STRINGS = {
  TITLE: 'Earnings',
  HEADER_TAG: 'Worker',
  OVERLINE: 'EARNINGS',
  HEADING: 'Worker earnings',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  STATUS: {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  } as Record<PayoutStatus, string>,
  /** "4 h × ₹150 = ₹600" */
  shiftMeta: (hours: number, rate: string, total: string) =>
    `${hours} h × ${rate} = ${total}`,
  /** "6 × ₹600 = ₹3,600" */
  groupMeta: (shifts: number, each: string, total: string) =>
    `${shifts} × ${each} = ${total}`,
  WITHDRAW: 'Withdraw',
  VIEW_ALL: 'View all earnings',
  SUPPORT: 'Payment support',
  AVAILABLE: 'Available to withdraw',
  thisMonth: (amount: string, shifts: number) =>
    `${amount} this month · ${shifts} shift${shifts === 1 ? '' : 's'} completed`,
  EMPTY: 'No earnings yet. Complete a shift to get paid.',
  ENTRY_TYPE: {
    shift_earning: 'Shift pay',
    withdrawal: 'Withdrawal',
    withdrawal_reversal: 'Withdrawal returned',
    commission: 'Service fee',
    cancellation_fee: 'Cancellation fee',
    cancellation_compensation: 'Cancellation pay',
    adjustment: 'Adjustment',
    promo_credit: 'Promo credit',
    fee_waiver: 'Fee waived',
  } as Record<LedgerEntryType, string>,
  duesTitle: (amount: string) => `You owe ${amount} in fees`,
  DUES_BODY: 'It’s taken from your next earnings. You can keep booking shifts meanwhile.',
  RELIABILITY: 'Reliability',
  strikes: (count: number, ban: number) => `${count} of ${ban} strikes`,
  strikesBody: (days: number, limit: number) =>
    `Late cancellations and no-shows add strikes. They expire after ${days} days. At ${limit} you’ll see fewer shifts for a while.`,
  limitedUntil: (date: string) => `Fewer shifts shown until ${date}.`,
  ON_HOLD: 'Your account is on hold. Contact support to review it.',
  PROMO_LABEL: 'Promo code',
  PROMO_PLACEHOLDER: 'Enter code',
  PROMO_REDEEM: 'Redeem',
  promoPending: (code: string) =>
    `${code.toUpperCase()} will reduce the service fee on your next payout.`,
  PROMO_DONE: 'Code saved',
  PROMO_FAILED: 'Code can’t be used',
} as const;
