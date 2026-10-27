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

export type LedgerPage = {
  items: LedgerEntry[];
  limit: number;
  offset: number;
};

export type PayoutAccountType = 'upi' | 'paytm' | 'bank';

export type PayoutAccount = {
  id: string;
  account_type: PayoutAccountType;
  display: string;
  upi_id?: string | null;
  paytm_phone?: string | null;
  bank_account_last4?: string | null;
  bank_ifsc?: string | null;
  account_holder_name: string;
  is_default: boolean;
  is_verified: boolean;
};

export type UpiAccountInput = { upi_id: string; account_holder_name: string };

export type WithdrawalStatus = 'initiated' | 'processing' | 'paid' | 'failed';

export type Withdrawal = {
  id: string;
  amount_minor: number;
  currency: string;
  status: WithdrawalStatus;
  reference: string;
  payout_account_id: string;
  payout_display: string;
  failure_reason?: string | null;
  initiated_at: string;
  completed_at?: string | null;
};

export type WithdrawalCreate = {
  payout_account_id: string;
  amount_minor: number;
  idempotency_key: string;
};

export const earningsApi = {
  summary: () => apiRequest<EarningsSummaryResponse>('GET', '/worker/earnings'),
  entries: () => apiRequest<LedgerPage>('GET', '/worker/earnings/entries'),
  payoutAccounts: () =>
    apiRequest<PayoutAccount[]>('GET', '/worker/payout-accounts'),
  addUpiAccount: (body: UpiAccountInput) =>
    apiRequest<PayoutAccount>('POST', '/worker/payout-accounts', {
      body: { account_type: 'upi', make_default: true, ...body },
    }),
  /** Sending `upi_id` clears verification on the server, so send it only when it changed. */
  updateUpiAccount: (accountId: string, body: Partial<UpiAccountInput>) =>
    apiRequest<PayoutAccount>('PATCH', `/worker/payout-accounts/${accountId}`, {
      body: { ...body, make_default: true },
    }),
  /** Retrying with the same `idempotency_key` returns the original withdrawal. */
  createWithdrawal: (body: WithdrawalCreate) =>
    apiRequest<Withdrawal>('POST', '/worker/withdrawals', { body }),
  withdrawal: (withdrawalId: string) =>
    apiRequest<Withdrawal>('GET', `/worker/withdrawals/${withdrawalId}`),
};
