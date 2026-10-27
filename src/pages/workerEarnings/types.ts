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
