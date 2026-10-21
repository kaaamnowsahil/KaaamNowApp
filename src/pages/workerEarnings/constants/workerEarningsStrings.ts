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
} as const;
