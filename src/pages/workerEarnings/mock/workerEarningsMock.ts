import type { PayoutMethod, PayoutStatus } from '@/types';

export type EarningsSummary = {
  pending: number;
  processing: number;
  completed: number;
  periodLabel: string;
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
  businessName?: string;
  dateLabel?: string;
  amount: number;
  status: PayoutStatus;
  reference?: string;
  method?: PayoutMethod;
  destination?: string;
  requestedAt?: string;
  processedAt?: string;
  failureReason?: string;
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
    businessName: 'Third Wave Coffee',
    dateLabel: '18 Oct 2026',
    hours: 4,
    rate: 150,
    amount: 600,
    status: 'pending',
    reference: 'KN-PAY-62180',
    method: 'UPI',
    destination: 'aarav@okaxis',
    requestedAt: '2026-10-18T18:30:00+05:30',
  },
  {
    id: 'row-event',
    title: 'Event service · 12 Oct',
    businessName: 'The Park Events',
    dateLabel: '12 Oct 2026',
    hours: 6,
    rate: 175,
    amount: 1050,
    status: 'processing',
    reference: 'KN-PAY-62179',
    method: 'Paytm',
    destination: '+91 ••••• 3210',
    requestedAt: '2026-10-12T17:20:00+05:30',
  },
  {
    id: 'row-previous',
    title: 'Previous completed shifts',
    shifts: 6,
    amount: 3600,
    status: 'completed',
    reference: 'KN-PAY-62176',
    method: 'Bank',
    destination: 'HDFC ••4821',
    requestedAt: '2026-10-04T18:00:00+05:30',
    processedAt: '2026-10-05T10:15:00+05:30',
  },
  {
    id: 'row-failed',
    title: 'Retail restock · 8 Oct',
    businessName: 'Nature’s Basket',
    dateLabel: '8 Oct 2026',
    hours: 5,
    rate: 140,
    amount: 700,
    status: 'failed',
    reference: 'KN-PAY-62175',
    method: 'Bank',
    destination: 'HDFC ••4821',
    requestedAt: '2026-10-08T18:00:00+05:30',
    processedAt: '2026-10-09T10:15:00+05:30',
    failureReason: 'Bank account details could not be verified.',
  },
];
