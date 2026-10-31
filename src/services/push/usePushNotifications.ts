import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { navigationRef } from '@/route/navigationRef';
import { inTab } from '@/route/tabRoutes';
import { tr } from '@/services/i18n/tr';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import type { AppStackParamList, TabParamList } from '@/types';

import { registerForPush } from './pushService';

const READY_RETRIES = 20;
const READY_DELAY_MS = 250;

const waitForNavigation = async () => {
  for (let i = 0; i < READY_RETRIES && !navigationRef.isReady(); i += 1) {
    await new Promise<void>(resolve => setTimeout(resolve, READY_DELAY_MS));
  }
  return navigationRef.isReady();
};

/** Opens a screen inside a tab so the bottom tabs stay visible. */
const openInTab = <S extends keyof AppStackParamList>(
  tab: keyof TabParamList,
  screen: S,
  params?: AppStackParamList[S],
) => navigationRef.navigate(ROUTES.mainTabs, inTab(tab, screen, params));

/** Booking pushes open the booking; everything else opens the inbox. */
export const openFromPush = async (message: RemoteMessage, role: UserRole | null) => {
  if (!(await waitForNavigation())) return;
  const inbox = () =>
    openInTab(
      role === 'business' ? ROUTES.businessLive : ROUTES.workerHome,
      ROUTES.notifications,
    );
  const assignmentId = message.data?.assignment_id;
  if (typeof assignmentId !== 'string' || !assignmentId) {
    inbox();
    return;
  }
  if (role === 'business') {
    openInTab(ROUTES.businessShifts, ROUTES.businessScheduledWorkerTracking, {
      assignmentId,
    });
    return;
  }
  try {
    const assignment = await shiftsApi.assignment(assignmentId);
    const shift = {
      ...toShift(assignment.shift),
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
    };
    if (assignment.status === 'checked_in') {
      openInTab(ROUTES.workerShifts, ROUTES.activeShift, { shift });
    } else {
      openInTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
        shift,
        bookingStatus: 'confirmed',
      });
    }
  } catch {
    inbox();
  }
};

/** Registers the device and handles pushes while signed in. Mount once inside the app stack. */
export const usePushNotifications = (role: UserRole | null) => {
  useEffect(() => {
    const messaging = getMessaging();
    let stopTokenRefresh: (() => void) | undefined;
    let isActive = true;
    let isSettled = false;
    let isRegistering = false;

    // Retried each time the app returns to the foreground until it succeeds or
    // the user declines, so an offline sign-in still registers later.
    const register = () => {
      if (isSettled || isRegistering) return;
      isRegistering = true;
      registerForPush()
        .then(stop => {
          isSettled = true;
          if (!stop) return;
          if (isActive) stopTokenRefresh = stop;
          else stop();
        })
        .catch(error => console.warn('Push registration failed; will retry.', error))
        .finally(() => {
          isRegistering = false;
        });
    };
    register();
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') register();
    });

    getInitialNotification(messaging).then(message => {
      if (message && isActive) openFromPush(message, role);
    });
    const stopOpened = onNotificationOpenedApp(messaging, message =>
      openFromPush(message, role),
    );
    const stopForeground = onMessage(messaging, message => {
      const { title, body } = message.notification ?? {};
      if (!title) return;
      Alert.alert(title, body ?? '', [
        { text: tr('common.close'), style: 'cancel' },
        { text: tr('common.view'), onPress: () => openFromPush(message, role) },
      ]);
    });

    return () => {
      isActive = false;
      appState.remove();
      stopTokenRefresh?.();
      stopOpened();
      stopForeground();
    };
  }, [role]);
};
