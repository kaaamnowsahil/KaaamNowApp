import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/** Overrides the Android back button, e.g. to leave a finished flow for a tab. */
export const useHardwareBack = (onBack: () => void) => {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);
};
