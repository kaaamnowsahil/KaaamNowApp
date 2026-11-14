import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '@/services/api/apiClient';
import { mediaUrl, type PickedImage } from '@/services/api/meApi';
import {
  earningsApi,
  type PayoutAccount,
} from '@/services/earnings/earningsApi';
import { pickImageFromGallery } from '@/services/media/pickImage';
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
  const { t } = useTranslation();
  const query = useApiQuery(() => earningsApi.payoutAccounts(), []);
  const [accountOverride, setAccountOverride] = useState<PayoutAccount | null>(null);
  const account = accountOverride ?? (query.data ? upiAccountOf(query.data) : null);
  const [holderName, setHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [qrImage, setQrImage] = useState<PickedImage | null>(null);
  const [qrRemoved, setQrRemoved] = useState(false);
  const [qrError, setQrError] = useState('');
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
  const detailsUnchanged =
    !upiChanged && holder === (account?.account_holder_name ?? '');
  const isUnchanged =
    detailsUnchanged &&
    !qrImage &&
    !(qrRemoved && account?.upi_qr_url);

  const chooseQr = async () => {
    setQrError('');
    try {
      const image = await pickImageFromGallery();
      if (!image) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.type)) {
        setQrError(t('payoutAccount.qrType'));
        return;
      }
      setQrImage(image);
      setQrRemoved(false);
      setSaveError('');
    } catch (error) {
      setQrError(errorMessage(error));
    }
  };

  const removeQr = () => {
    setQrImage(null);
    setQrRemoved(true);
    setQrError('');
    setSaveError('');
  };

  const save = async () => {
    if (!upiValid || !nameValid || isUnchanged || isSaving) return;
    setIsSaving(true);
    setSaveError('');
    try {
      let savedAccount: PayoutAccount;
      if (account) {
        savedAccount = detailsUnchanged
          ? account
          : await earningsApi.updateUpiAccount(account.id, {
              account_holder_name: holder,
              ...(upiChanged ? { upi_id: upi } : {}),
            });
        setAccountOverride(savedAccount);
      } else {
        savedAccount = await earningsApi.addUpiAccount({
          upi_id: upi,
          account_holder_name: holder,
        });
        setAccountOverride(savedAccount);
      }
      if (qrImage) {
        savedAccount = await earningsApi.uploadUpiQr(savedAccount.id, qrImage);
        setAccountOverride(savedAccount);
      } else if (qrRemoved && savedAccount.upi_qr_url) {
        savedAccount = await earningsApi.removeUpiQr(savedAccount.id);
        setAccountOverride(savedAccount);
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
    qrError,
    qrPreviewUri:
      qrImage?.uri ?? mediaUrl(upiChanged || qrRemoved ? null : account?.upi_qr_url),
    chooseQr,
    removeQr,
    save,
  };
};
