import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { apiRequest } from '@/services/api/apiClient';

import packageJson from '../../../package.json';

type DeviceResponse = { id: string; platform: string; is_active: boolean };

let deviceId: string | null = null;

const askPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await requestPermission(getMessaging());
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
};

const saveToken = async (pushToken: string) => {
  const device = await apiRequest<DeviceResponse>('POST', '/me/devices', {
    body: {
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      push_token: pushToken,
      app_version: packageJson.version,
    },
  });
  deviceId = device.id;
};

/**
 * Asks for permission, registers this device's FCM token with the API and keeps
 * it current. Resolves to `null` when the user denied notifications; rejects when
 * the token could not be saved (e.g. offline) so the caller can retry later.
 * Otherwise returns an unsubscribe for the token-refresh listener.
 */
export const registerForPush = async (): Promise<(() => void) | null> => {
  if (!(await askPermission())) return null;
  const messaging = getMessaging();
  const stopRefresh = onTokenRefresh(messaging, token => {
    saveToken(token).catch(() => undefined);
  });
  try {
    await saveToken(await getToken(messaging));
  } catch (error) {
    stopRefresh();
    throw error;
  }
  return stopRefresh;
};

/** Call while the session is still valid, before clearing tokens on sign-out. */
export const unregisterPush = async () => {
  const id = deviceId;
  deviceId = null;
  await Promise.allSettled([
    id ? apiRequest<void>('DELETE', `/me/devices/${id}`) : Promise.resolve(),
    deleteToken(getMessaging()),
  ]);
};
