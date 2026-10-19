import { useState } from 'react';

import {
  fetchCurrentAddress,
  type PickedAddress,
} from '@/services/location/currentAddress';

/** Fills an address from the device location; caller can still edit it manually. */
export const useCurrentAddress = (
  onPicked: (picked: PickedAddress) => void,
) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const locate = async () => {
    setIsLocating(true);
    setLocateError(null);
    try {
      onPicked(await fetchCurrentAddress());
    } catch {
      setLocateError('Could not get your location. Please type your address.');
    } finally {
      setIsLocating(false);
    }
  };

  return { locate, isLocating, locateError };
};
