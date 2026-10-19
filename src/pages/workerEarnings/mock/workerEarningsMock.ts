import type { PayoutStatus } from '@/types';

export type EarningsSummary = {
  pending: number;
  processing: number;
  completed: number;
  /** e.g. "October · Completed payouts" */
  periodLabel: string;
  /** Most recent completed payout, e.g. "Café service associate · 18 Oct 2026". */
  lastPaid: string;
};

export type EarningsRow = {
  id: string;
  title: string;
  /** Hours worked; omitted for grouped rows. */
  hours?: number;
  rate?: number;
  /** Number of shifts in a grouped row. */
  shifts?: number;
  amount: number;
  status: PayoutStatus;
};

export const SUMMARY: EarningsSummary = {
  pending: 600,
  processing: 1050,
  completed: 3600,
  periodLabel: 'October · Completed payouts',
  lastPaid: 'Café service associate · 18 Oct 2026',
};

export const ROWS: EarningsRow[] = [
  {
    id: 'row-cafe',
    title: 'Café service · 18 Oct',
    hours: 4,
    rate: 150,
    amount: 600,
    status: 'pending',
  },
  {
    id: 'row-event',
    title: 'Event service · 12 Oct',
    hours: 6,
    rate: 175,
    amount: 1050,
    status: 'processing',
  },
  {
    id: 'row-previous',
    title: 'Previous completed shifts',
    shifts: 6,
    amount: 3600,
    status: 'completed',
  },
];
