import { ApiError } from '@/services/api/apiClient';

import type { PayoutAccount, WithdrawalStatus } from './earningsApi';

export type AmountProblem = 'invalid' | 'belowMin' | 'aboveAvailable';
export type WithdrawalTone = 'pending' | 'paid' | 'failed';

const AMOUNT_PATTERN = /^(\d{1,9})(?:\.(\d{1,2}))?$/;

/** Rupee text such as "1,250.5" to integer paise, or null when it is not a valid amount. */
export const parseAmountMinor = (text: string): number | null => {
  const match = AMOUNT_PATTERN.exec(text.replace(/[₹,\s]/g, ''));
  if (!match) return null;
  const paise =
    Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return paise > 0 ? paise : null;
};

/** Integer paise to editable rupee text without grouping, e.g. 125050 -> "1250.50". */
export const minorToAmountText = (minor: number): string => {
  const rupees = Math.floor(minor / 100);
  const paise = minor % 100;
  return paise ? `${rupees}.${String(paise).padStart(2, '0')}` : String(rupees);
};

export const amountProblem = (
  amountMinor: number | null,
  availableMinor: number,
  minMinor: number,
): AmountProblem | null => {
  if (amountMinor === null) return 'invalid';
  if (amountMinor < minMinor) return 'belowMin';
  if (amountMinor > availableMinor) return 'aboveAvailable';
  return null;
};

export const canWithdraw = (availableMinor: number, minMinor: number) =>
  availableMinor > 0 && availableMinor >= minMinor;

export const defaultAccountId = (accounts: PayoutAccount[]) =>
  (accounts.find(account => account.is_default) ?? accounts[0])?.id ?? '';

export const withdrawalTone = (status: WithdrawalStatus): WithdrawalTone => {
  if (status === 'paid') return 'paid';
  if (status === 'failed') return 'failed';
  return 'pending';
};

/** RN has no crypto.randomUUID; the key only has to be unique per worker. */
export const newIdempotencyKey = (now = Date.now(), random = Math.random) => {
  const part = () => random().toString(36).slice(2, 10).padEnd(8, '0');
  return `wd_${now.toString(36)}${part()}${part()}`;
};

const ERROR_KEYS: Record<
  string,
  AmountProblem | 'accountMissing' | 'staleRequest'
> = {
  withdrawal_below_min: 'belowMin',
  insufficient_balance: 'aboveAvailable',
  payout_account_not_found: 'accountMissing',
  idempotency_mismatch: 'staleRequest',
};

/** `withdraw.*` translation key for a known server rejection, else null. */
export const withdrawErrorKey = (error: unknown) =>
  error instanceof ApiError ? ERROR_KEYS[error.code] ?? null : null;
