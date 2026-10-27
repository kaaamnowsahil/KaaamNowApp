import { useState } from 'react';
import { Alert } from 'react-native';

import { errorMessage } from '@/services/api/apiClient';
import { tr } from '@/services/i18n/tr';

import { supportApi } from './supportApi';

const k = (key: string) => tr(`emergency.${key}`);

const EMERGENCY_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get BODY() {
    return k('body');
  },
  get CANCEL() {
    return k('cancel');
  },
  get CONFIRM() {
    return k('confirm');
  },
  get SENT_TITLE() {
    return k('sentTitle');
  },
  get SENT_BODY() {
    return k('sentBody');
  },
  get FAILED() {
    return k('failed');
  },
};

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
