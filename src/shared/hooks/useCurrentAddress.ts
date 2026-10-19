import { useState } from 'react';

import type { PickedAddress } from '@/types';

const LOCATE_DELAY_MS = 600;

/** Fills an address from the page's mock location; caller can still edit it manually. */
export const useCurrentAddress = (
  mockAddress: PickedAddress,
  onPicked: (picked: PickedAddress) => void,
) => {
  const [isLocating, setIsLocating] = useState(false);

  const locate = () => {
    setIsLocating(true);
    setTimeout(() => {
      onPicked(mockAddress);
      setIsLocating(false);
    }, LOCATE_DELAY_MS);
  };

  return { locate, isLocating, locateError: null as string | null };
};
