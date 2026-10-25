import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export type DevicePosition = { latitude: number; longitude: number };

/** Resolves null when permission is denied or no fix arrives in time. */
export const getDevicePosition = async (
  timeoutMs = 12000,
): Promise<DevicePosition | null> => {
  try {
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) return null;
    }
  } catch {
    return null;
  }

  return new Promise(resolve => {
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
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
};
