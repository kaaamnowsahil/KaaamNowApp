import { useState } from 'react';
import { Alert } from 'react-native';

import { errorMessage } from '@/services/api/apiClient';

import { supportApi } from './supportApi';

const EMERGENCY_STRINGS = {
  TITLE: 'Emergency help',
  BODY: 'Our support team will be alerted right away and will call you. In danger? Call 112 first.',
  CANCEL: 'Cancel',
  CONFIRM: 'Alert support',
  SENT_TITLE: 'Support alerted',
  SENT_BODY: 'We’ve flagged this booking as urgent. Keep your phone nearby.',
  FAILED: 'Couldn’t reach support',
} as const;

/** Emergency button on a booking: confirm, then raise an urgent ticket. */
export const useEmergency = (assignmentId?: string | null) => {
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!assignmentId) return;
    setBusy(true);
    try {
      await supportApi.emergency(assignmentId);
      Alert.alert(EMERGENCY_STRINGS.SENT_TITLE, EMERGENCY_STRINGS.SENT_BODY);
    } catch (error) {
      Alert.alert(EMERGENCY_STRINGS.FAILED, errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const trigger = () =>
    Alert.alert(EMERGENCY_STRINGS.TITLE, EMERGENCY_STRINGS.BODY, [
      { text: EMERGENCY_STRINGS.CANCEL, style: 'cancel' },
      { text: EMERGENCY_STRINGS.CONFIRM, style: 'destructive', onPress: send },
    ]);

  return { busy, trigger, isAvailable: Boolean(assignmentId) };
};
