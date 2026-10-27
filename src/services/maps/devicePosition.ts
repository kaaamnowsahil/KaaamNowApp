import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export type DevicePosition = { latitude: number; longitude: number };

// The library defaults to Android's LocationManager, where low accuracy means the network
// provider only: it never gets a fix on emulators and is slow indoors. The fused provider
// (Play Services) combines GPS, Wi-Fi and cell, and also works with "Approximate" permission.
if (Platform.OS === 'android') {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    locationProvider: 'playServices',
  });
}

/** Android 12+ lets the user grant only "Approximate" (coarse); that is enough here. */
const hasAndroidPermission = async (): Promise<boolean> => {
  const { ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION } = PermissionsAndroid.PERMISSIONS;
  const result = await PermissionsAndroid.requestMultiple([
    ACCESS_FINE_LOCATION,
    ACCESS_COARSE_LOCATION,
  ]);
  return [ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION].some(
    permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

const requestFix = (
  enableHighAccuracy: boolean,
  timeoutMs: number,
): Promise<DevicePosition | null> =>
  new Promise(resolve => {
    const watchdog = setTimeout(() => resolve(null), timeoutMs + 2000);
    Geolocation.getCurrentPosition(
      position => {
        clearTimeout(watchdog);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(watchdog);
        resolve(null);
      },
      { enableHighAccuracy, timeout: timeoutMs, maximumAge: 60000 },
    );
  });

/**
 * Resolves null when permission is denied or no fix arrives in time. Tries a quick
 * network/cached fix first, then GPS, within roughly `timeoutMs` overall.
 */
export const getDevicePosition = async (
  timeoutMs = 12000,
): Promise<DevicePosition | null> => {
  try {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) return null;
  } catch {
    return null;
  }
  const quickMs = Math.min(5000, Math.round(timeoutMs / 2));
  return (
    (await requestFix(false, quickMs)) ??
    (await requestFix(true, Math.max(timeoutMs - quickMs, 3000)))
  );
};
