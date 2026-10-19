import { useState } from 'react';

import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { Shift } from '@/types';

import { DEFAULT_DETAILS, SHIFT_DETAILS } from '../mock';

export const useShiftDetails = (shift: Shift) => {
  const [isRequested, setIsRequested] = useState(false);
  const [isOfferConfirmed, setIsOfferConfirmed] = useState(false);
  const isLoading = useMockLoading();
  const extra = SHIFT_DETAILS[shift.id] ?? DEFAULT_DETAILS;

  return {
    isLoading,
    extra,
    address: extra.address || shift.area,
    isLive: shift.status === 'live',
    isRequested,
    request: () => setIsRequested(true),
    isOfferConfirmed,
    confirmOffer: () => setIsOfferConfirmed(true),
  };
};
