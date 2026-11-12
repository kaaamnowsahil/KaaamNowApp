import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { AppState, NativeModules, Platform } from 'react-native';

import i18n from '@/services/i18n/i18n';
import { openFromPush } from '@/services/notifications/openNotificationTarget';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';

import { useUnreadNotifications } from '@/services/notifications/useUnreadNotifications';

import { registerForPush } from './pushService';

export { openFromPush };

const RING_LANGUAGES = new Set([
  'bn',
  'en',
  'gu',
  'hi',
  'kn',
  'ml',
  'mr',
  'or',
  'pa',
  'ta',
  'te',
  'ur',
]);

/** Same files as the web: ring, then the spoken line, in the app language. */
const spokenRing = (role: UserRole | null, kind: unknown): string | null => {
  const code = i18n.language.split('-')[0] ?? 'en';
  const language = RING_LANGUAGES.has(code) ? code : 'en';
  if (role === 'worker' && kind === 'live_request') return `ring_${language}_new_work`;
  if (role === 'business' && kind === 'live_worker_accepted') {
    return `ring_${language}_worker_accepted`;
  }
  return null;
};

/** Registers the device and handles pushes while signed in. Mount once inside the app stack. */
export const usePushNotifications = (role: UserRole | null) => {
  const [notice, setNotice] = useState<{
    title: string;
    body: string;
    message: RemoteMessage;
    role: UserRole | null;
  } | null>(null);

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
      void useUnreadNotifications.getState().refresh();
      const data = message.data ?? {};
      const title = message.notification?.title ?? data.title;
      const body = message.notification?.body ?? data.body ?? '';
      if (typeof title !== 'string' || !title) return;
      const sound = spokenRing(role, data.kind);
      if (Platform.OS === 'android' && sound) NativeModules.RingPlayer?.play?.(sound);
      setNotice({ title, body: typeof body === 'string' ? body : '', message, role });
    });

    return () => {
      isActive = false;
      appState.remove();
      stopTokenRefresh?.();
      stopOpened();
      stopForeground();
    };
  }, [role]);

  return {
    notice,
    dismissNotice: () => setNotice(null),
    viewNotice: () => {
      if (!notice) return;
      const { message, role: noticeRole } = notice;
      setNotice(null);
      void openFromPush(message, noticeRole);
    },
  };
};
