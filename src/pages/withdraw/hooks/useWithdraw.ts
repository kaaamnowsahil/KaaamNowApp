import { useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api/apiClient';
import { earningsApi, type Withdrawal } from '@/services/earnings/earningsApi';
import {
  amountProblem,
  canWithdraw,
  defaultAccountId,
  minorToAmountText,
  newIdempotencyKey,
  parseAmountMinor,
  withdrawErrorKey,
} from '@/services/earnings/withdrawLogic';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

type SubmitError = { key: string } | { text: string } | null;

const loadWithdrawData = async () => {
  const [summary, accounts] = await Promise.all([
    earningsApi.summary(),
    earningsApi.payoutAccounts(),
  ]);
  return { summary, accounts };
};

/**
 * Earnings → Withdraw.
 * - data: GET /worker/earnings, GET /worker/payout-accounts (reloaded on focus)
 * - submit: POST /worker/withdrawals with one idempotency key per amount + account
 */
export const useWithdraw = (onCreated: (withdrawal: Withdrawal) => void) => {
  const query = useApiQuery(loadWithdrawData, []);
  const data = query.data;
  const [amountText, setAmountText] = useState('');
  const [accountId, setAccountId] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError>(null);
  const inFlight = useRef(false);
  const attempt = useRef<{ signature: string; key: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    const { summary, accounts } = data;
    setAccountId(current =>
      accounts.some(account => account.id === current)
        ? current
        : defaultAccountId(accounts),
    );
    setAmountText(current =>
      current ||
      !canWithdraw(summary.available_minor, summary.min_withdrawal_minor)
        ? current
        : minorToAmountText(summary.available_minor),
    );
  }, [data]);

  const amountMinor = parseAmountMinor(amountText);
  const problem = data
    ? amountProblem(
        amountMinor,
        data.summary.available_minor,
        data.summary.min_withdrawal_minor,
      )
    : null;

  const submit = async () => {
    setTouched(true);
    if (!data || problem || !accountId || amountMinor === null) return;
    if (inFlight.current) return;
    const signature = `${accountId}:${amountMinor}`;
    if (attempt.current?.signature !== signature) {
      attempt.current = { signature, key: newIdempotencyKey() };
    }
    inFlight.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      onCreated(
        await earningsApi.createWithdrawal({
          payout_account_id: accountId,
          amount_minor: amountMinor,
          idempotency_key: attempt.current.key,
        }),
      );
    } catch (error) {
      const key = withdrawErrorKey(error);
      setSubmitError(key ? { key } : { text: errorMessage(error) });
      if (key) {
        attempt.current = null;
        query.reload();
      }
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    isLoading: query.isLoading,
    loadError: query.error,
    reload: query.reload,
    data,
    amountText,
    setAmountText: (value: string) => {
      setAmountText(value);
      setSubmitError(null);
    },
    accountId,
    setAccountId,
    problem: touched || amountText ? problem : null,
    isSubmitting,
    submitError,
    submit,
  };
};
