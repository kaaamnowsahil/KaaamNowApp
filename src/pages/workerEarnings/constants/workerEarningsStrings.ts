import type { PayoutStatus } from '@/types';

import type { EarningsPeriod } from '../mock';

export const WORKER_EARNINGS_STRINGS = {
  TITLE: 'Earnings',
  OVERLINE: 'Earnings',
  HEADING: 'Worker earnings',
  PERIOD_LABEL: { week: 'Weekly', month: 'Monthly' } as Record<
    EarningsPeriod,
    string
  >,
  switchPeriod: (current: string) => `${current}, tap to switch period`,
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  lastPaid: (text: string) => `Last paid: ${text}`,
  STATUS: {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
  } as Record<PayoutStatus, string>,
  shiftMeta: (hours: number, rate: string, total: string) =>
    `${hours} h · ${rate} · ${total}`,
  groupMeta: (shifts: number, total: string) =>
    `${shifts} shifts · ${total}`,
  VIEW_ALL: 'View all earnings',
  SUPPORT: 'Payment support',
} as const;
