import { apiRequest } from '@/services/api/apiClient';

export type LedgerEntryType =
  | 'shift_earning'
  | 'withdrawal'
  | 'withdrawal_reversal'
  | 'commission'
  | 'cancellation_fee'
  | 'cancellation_compensation'
  | 'adjustment'
  | 'promo_credit'
  | 'fee_waiver';

export type LedgerEntry = {
  id: string;
  entry_type: LedgerEntryType;
  amount_minor: number;
  currency: string;
  assignment_id?: string | null;
  withdrawal_id?: string | null;
  description: string;
  created_at: string;
};

export type Reliability = {
  strikes: number;
  strikes_to_limit: number;
  strikes_to_ban: number;
  window_days: number;
  feed_limited_until?: string | null;
  on_hold: boolean;
};

export type EarningsSummaryResponse = {
  currency: string;
  /** Negative while fees are owed. */
  available_minor: number;
  dues_minor: number;
  pending_minor: number;
  in_flight_withdrawals_minor: number;
  lifetime_minor: number;
  this_month_minor: number;
  completed_shifts: number;
  min_withdrawal_minor: number;
  recent: LedgerEntry[];
  reliability?: Reliability | null;
};

export type LedgerPage = { items: LedgerEntry[]; limit: number; offset: number };

export const earningsApi = {
  summary: () => apiRequest<EarningsSummaryResponse>('GET', '/worker/earnings'),
  entries: () => apiRequest<LedgerPage>('GET', '/worker/earnings/entries'),
};
