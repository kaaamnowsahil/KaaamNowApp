import type { PayoutStatus } from '@/types';

export const EARNINGS_HISTORY_STRINGS = {
  TITLE: 'All earnings',
  monthTotal: (total: string) => `${total} earned`,
  title: (shift: string, date: string) => `${shift} · ${date}`,
  meta: (business: string, hours: number, amount: string) =>
    `${business} · ${hours} h · ${amount}`,
  STATUS: {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  } as Record<PayoutStatus, string>,
} as const;
