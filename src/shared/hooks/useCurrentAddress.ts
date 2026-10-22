import Geolocation from '@react-native-community/geolocation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermissionsAndroid, Platform } from 'react-native';

import { reverseGeocode } from '@/services/maps/googleMaps';
import type { PickedAddress } from '@/types';

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

    const onError = () => {
      setLocateError(t('workerSignup.locationError'));
      setIsLocating(false);
    };
    const getLocation = () =>
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            address = (await reverseGeocode({ latitude, longitude })) || address;
          } catch {
            // Coordinates are still a valid location when reverse geocoding is unavailable.
          }
          onPicked({ address, lat: latitude, lng: longitude });
          setIsLocating(false);
        },
        onError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );

    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocateError(t('workerSignup.locationPermissionDenied'));
          setIsLocating(false);
          return;
        }
        getLocation();
      } else {
        Geolocation.requestAuthorization(getLocation, onError);
      }
    } catch {
      onError();
    }
  };

  return { locate, isLocating, locateError };
};
