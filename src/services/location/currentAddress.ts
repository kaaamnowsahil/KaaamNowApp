import Geolocation from '@react-native-community/geolocation';

import { reverseGeocodeUrl } from '@/constants/endpoints';
import { http } from '@/services/api/httpClient';

export type PickedAddress = { address: string; lat: number; lng: number };

type NominatimResult = {
  display_name?: string;
  address?: Record<string, string | undefined>;
};

const getPosition = () =>
  new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });

/** "Koramangala, Bengaluru" style short address from a reverse-geocode result. */
export const shortAddress = (result: NominatimResult): string => {
  const a = result.address ?? {};
  const area = a.suburb ?? a.neighbourhood ?? a.road;
  const city = a.city ?? a.town ?? a.village ?? a.state_district;
  const parts = [area, city].filter(Boolean);
  return parts.length ? parts.join(', ') : result.display_name ?? '';
};

/** Device location -> readable address. Coordinates are kept even if geocoding fails. */
export const fetchCurrentAddress = async (): Promise<PickedAddress> => {
  Geolocation.requestAuthorization();
  const { lat, lng } = await getPosition();
  try {
    const result = await http<NominatimResult>(reverseGeocodeUrl(lat, lng), {
      headers: { 'User-Agent': 'KaamNow/0.1 (in.kaaamnow.app)' },
    });
    return { address: shortAddress(result), lat, lng };
  } catch {
    return { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng };
  }
};
