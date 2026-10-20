export type Coordinates = {
  latitude: number;
  longitude: number;
};

declare const process: {
  env: {
    GOOGLE_MAPS_API_KEY?: string;
  };
};

const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
export const isGoogleMapsConfigured = Boolean(apiKey);

const buildQuery = (values: Record<string, string>) =>
  Object.entries(values)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

export const getGoogleStaticMapUrl = (
  coordinates: Coordinates,
): string | null => {
  if (!apiKey) return null;
  const center = `${coordinates.latitude},${coordinates.longitude}`;
  const params = buildQuery({
    center,
    zoom: '16',
    size: '640x320',
    scale: '2',
    maptype: 'roadmap',
    markers: `color:red|${center}`,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`;
};

export const geocodeAddress = async (
  address: string,
  signal?: AbortSignal,
): Promise<Coordinates | null> => {
  if (!apiKey) return null;
  const params = buildQuery({ address, key: apiKey });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Google Geocoding request failed (${response.status}).`);
  }

  const result = (await response.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{
      geometry?: { location?: { lat: number; lng: number } };
    }>;
  };
  if (result.status === 'ZERO_RESULTS') return null;
  if (result.status !== 'OK') {
    throw new Error(
      result.error_message ?? `Google Geocoding returned ${result.status}.`,
    );
  }

  const location = result.results?.[0]?.geometry?.location;
  return location ? { latitude: location.lat, longitude: location.lng } : null;
};

export const reverseGeocode = async (
  coordinates: Coordinates,
  signal?: AbortSignal,
): Promise<string | null> => {
  if (!apiKey) return null;
  const params = buildQuery({
    latlng: `${coordinates.latitude},${coordinates.longitude}`,
    key: apiKey,
  });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Google reverse geocoding failed (${response.status}).`);
  }

  const result = (await response.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{ formatted_address?: string }>;
  };
  if (result.status === 'ZERO_RESULTS') return null;
  if (result.status !== 'OK') {
    throw new Error(
      result.error_message ?? `Google Geocoding returned ${result.status}.`,
    );
  }
  return result.results?.[0]?.formatted_address ?? null;
};
