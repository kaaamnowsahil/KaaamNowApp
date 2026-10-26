import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { navigationRef } from '@/route/navigationRef';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';

import { registerForPush } from './pushService';

const PUSH_STRINGS = { CLOSE: 'Close', VIEW: 'View' } as const;
const READY_RETRIES = 20;
const READY_DELAY_MS = 250;

const waitForNavigation = async () => {
  for (let i = 0; i < READY_RETRIES && !navigationRef.isReady(); i += 1) {
    await new Promise<void>(resolve => setTimeout(resolve, READY_DELAY_MS));
  }
  return navigationRef.isReady();
};

/** Booking pushes open the booking; everything else opens the inbox. */
const openFromPush = async (message: RemoteMessage, role: UserRole | null) => {
  if (!(await waitForNavigation())) return;
  const assignmentId = message.data?.assignment_id;
  if (typeof assignmentId !== 'string' || !assignmentId) {
    navigationRef.navigate(ROUTES.notifications);
    return;
  }
  if (role === 'business') {
    navigationRef.navigate(ROUTES.businessScheduledWorkerTracking, { assignmentId });
    return;
  }
  try {
    const assignment = await shiftsApi.assignment(assignmentId);
    const shift = {
      ...toShift(assignment.shift),
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
    };
    navigationRef.navigate(
      assignment.status === 'checked_in' ? ROUTES.activeShift : ROUTES.shiftSecured,
      { shift },
    );
  } catch {
    navigationRef.navigate(ROUTES.notifications);
  }
};

/** Registers the device and handles pushes while signed in. Mount once inside the app stack. */
export const usePushNotifications = (role: UserRole | null) => {
  useEffect(() => {
    const messaging = getMessaging();
    let stopTokenRefresh: (() => void) | undefined;
    let isActive = true;

    registerForPush()
      .then(stop => {
        if (isActive) stopTokenRefresh = stop;
        else stop();
      })
      .catch(error => console.warn('Push registration failed.', error));

    getInitialNotification(messaging).then(message => {
      if (message && isActive) openFromPush(message, role);
    });
    const stopOpened = onNotificationOpenedApp(messaging, message => openFromPush(message, role));
    const stopForeground = onMessage(messaging, message => {
      const { title, body } = message.notification ?? {};
      if (!title) return;
      Alert.alert(title, body ?? '', [
        { text: PUSH_STRINGS.CLOSE, style: 'cancel' },
        { text: PUSH_STRINGS.VIEW, onPress: () => openFromPush(message, role) },
      ]);
    });

    return () => {
      isActive = false;
      stopTokenRefresh?.();
      stopOpened();
      stopForeground();
    };
  }, [role]);
};
