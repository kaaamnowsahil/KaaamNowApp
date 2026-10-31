import { useState } from 'react';

import { errorMessage } from '@/services/api/apiClient';
import { payInvoice } from '@/services/billing/billingApi';
import {
  shiftsApi,
  type BusinessShiftItem,
  type ShiftCancelPreview,
} from '@/services/shifts/shiftsApi';

/** Cancel / pay deposit / publish on a business shift card (Shifts tab and Dashboard). */
export const useShiftCardActions = (reload: () => void) => {
  const [cancelTarget, setCancelTarget] = useState<BusinessShiftItem | null>(
    null,
  );
  const [cancelPreview, setCancelPreview] = useState<ShiftCancelPreview | null>(
    null,
  );
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<{
    shiftId: string;
    message: string;
  } | null>(null);

  const openCancel = (shift: BusinessShiftItem) => {
    setCancelError('');
    setCancelPreview(null);
    setCancelTarget(shift);
    if (shift.shift_type === 'scheduled' && shift.booked_count > 0) {
      shiftsApi
        .shiftCancelPreview(shift.id)
        .then(setCancelPreview)
        .catch(() => undefined);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await shiftsApi.cancelShift(cancelTarget.id, '');
      setCancelTarget(null);
      reload();
    } catch (error) {
      setCancelError(errorMessage(error));
    } finally {
      setIsCancelling(false);
    }
  };

  const payDeposit = async (shift: BusinessShiftItem) => {
    if (!shift.deposit_invoice_id || payingId) return;
    setPayingId(shift.id);
    setCardError(null);
    try {
      await payInvoice(shift.deposit_invoice_id);
      reload();
    } catch (error) {
      setCardError({ shiftId: shift.id, message: errorMessage(error) });
    } finally {
      setPayingId(null);
    }
  };

  const publish = async (shift: BusinessShiftItem) => {
    if (publishingId) return;
    setPublishingId(shift.id);
    setCardError(null);
    try {
      await shiftsApi.publishShift(shift.id);
      reload();
    } catch (error) {
      setCardError({ shiftId: shift.id, message: errorMessage(error) });
    } finally {
      setPublishingId(null);
    }
  };

  return {
    cancelTarget,
    cancelPreview,
    cancelError,
    isCancelling,
    openCancel,
    closeCancel: () => {
      if (!isCancelling) setCancelTarget(null);
    },
    confirmCancel,
    payingId,
    publishingId,
    cardError,
    payDeposit,
    publish,
  };
};
