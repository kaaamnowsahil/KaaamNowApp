import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import type { TabAppNavigation } from '@/types';

import { RECONNECT_MS, SAVED_SHIFT } from '../mock';

export const useOffline = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const [isReconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!isReconnecting) {
      return;
    }
    const timer = setTimeout(() => {
      setReconnecting(false);
      navigation.goBack();
    }, RECONNECT_MS);
    return () => clearTimeout(timer);
  }, [isReconnecting, navigation]);

  return {
    isReconnecting,
    reconnect: () => setReconnecting(true),
    viewSaved: () =>
      navigation.navigate(ROUTES.shiftSecured, { shift: SAVED_SHIFT }),
  };
};
