import { useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api/apiClient';
import {
  earningsApi,
  type PayoutAccount,
} from '@/services/earnings/earningsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

const upiAccountOf = (accounts: PayoutAccount[]) => {
  const upi = accounts.filter(account => account.account_type === 'upi');
  return upi.find(account => account.is_default) ?? upi[0] ?? null;
};

/**
 * Profile → Payout account. Edits the worker's UPI payout account.
 * - data: GET /worker/payout-accounts
 * - save: PATCH the existing UPI account, or POST a new default one
 */
export const usePayoutAccount = (onSaved: () => void) => {
  const query = useApiQuery(() => earningsApi.payoutAccounts(), []);
  const account = query.data ? upiAccountOf(query.data) : null;
  const [holderName, setHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const prefilled = useRef(false);

  useEffect(() => {
    if (!query.data || prefilled.current) return;
    prefilled.current = true;
    setHolderName(account?.account_holder_name ?? '');
    setUpiId(account?.upi_id ?? '');
  }, [query.data, account]);

  const upi = upiId.trim();
  const holder = holderName.trim();
  const upiValid = UPI_PATTERN.test(upi);
  const nameValid = holder.length >= 2;
  const upiChanged = upi !== (account?.upi_id ?? '');
  const isUnchanged =
    !upiChanged && holder === (account?.account_holder_name ?? '');

  const save = async () => {
    if (!upiValid || !nameValid || isUnchanged || isSaving) return;
    setIsSaving(true);
    setSaveError('');
    try {
      if (account) {
        await earningsApi.updateUpiAccount(account.id, {
          account_holder_name: holder,
          ...(upiChanged ? { upi_id: upi } : {}),
        });
      } else {
        await earningsApi.addUpiAccount({
          upi_id: upi,
          account_holder_name: holder,
        });
      }
      onSaved();
    } catch (error) {
      setSaveError(errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading: query.isLoading,
    loadError: query.error,
    reload: query.reload,
    holderName,
    setHolderName,
    upiId,
    setUpiId: (value: string) => setUpiId(value.trim()),
    upiValid,
    nameValid,
    isVerified: Boolean(account?.is_verified) && !upiChanged,
    canSave: upiValid && nameValid && !isUnchanged && !isSaving,
    isSaving,
    saveError,
    save,
  };
};
