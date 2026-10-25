import Geolocation from '@react-native-community/geolocation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermissionsAndroid, Platform } from 'react-native';

import { reverseGeocode } from '@/services/maps/googleMaps';
import type { PickedAddress } from '@/types';

const LOCATE_TIMEOUT_MS = 20000;
const GEOCODE_TIMEOUT_MS = 8000;

const lookupAddress = async (latitude: number, longitude: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
  try {
    return await reverseGeocode({ latitude, longitude }, controller.signal);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const useCurrentAddress = (
  onPicked: (picked: PickedAddress) => void,
) => {
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const locate = async () => {
    if (isLocating) return;
    setIsLocating(true);
    setLocateError(null);

    let settled = false;
    const finish = (error: string | null) => {
      if (settled) return false;
      settled = true;
      clearTimeout(watchdog);
      setLocateError(error);
      setIsLocating(false);
      return true;
    };
    const watchdog = setTimeout(
      () => finish(t('workerSignup.locationError')),
      LOCATE_TIMEOUT_MS,
    );

    const getLocation = () =>
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          const address =
            (await lookupAddress(latitude, longitude)) ||
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          if (finish(null)) {
            onPicked({ address, lat: latitude, lng: longitude });
          }
        },
        () => finish(t('workerSignup.locationError')),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
      );

    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          finish(t('workerSignup.locationPermissionDenied'));
          return;
        }
      }
      getLocation();
    } catch {
      finish(t('workerSignup.locationError'));
    }
  };

  return { locate, isLocating, locateError };
};
