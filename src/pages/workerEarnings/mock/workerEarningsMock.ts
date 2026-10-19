import type { PayoutStatus } from '@/types';

export type EarningsPeriod = 'week' | 'month';

export type EarningsSummary = {
  pending: number;
  processing: number;
  completed: number;
  completedLabel: string;
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

export const SUMMARY: Record<EarningsPeriod, EarningsSummary> = {
  week: {
    pending: 600,
    processing: 1050,
    completed: 3600,
    completedLabel: 'October · Completed payouts',
    lastPaid: 'Café service associate · 16 Oct 2026',
  },
  month: {
    pending: 600,
    processing: 1050,
    completed: 12480,
    completedLabel: 'October · Completed payouts',
    lastPaid: 'Café service associate · 16 Oct 2026',
  },
};

export const ROWS: Record<EarningsPeriod, EarningsRow[]> = {
  week: [
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
      hours: 8,
      rate: 135,
      amount: 1080,
      status: 'processing',
    },
    {
      id: 'row-previous',
      title: 'Previous completed shifts',
      shifts: 6,
      amount: 3600,
      status: 'completed',
    },
  ],
  month: [
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
      hours: 8,
      rate: 135,
      amount: 1080,
      status: 'processing',
    },
    {
      id: 'row-previous',
      title: 'Previous completed shifts',
      shifts: 21,
      amount: 12480,
      status: 'completed',
    },
  ],
};
