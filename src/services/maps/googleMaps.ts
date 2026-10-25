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

const OSM_HEADERS = {
  'User-Agent': 'KaaamNowApp/1.0',
  Accept: 'application/json',
};

const geocodeAddressOsm = async (
  address: string,
  signal?: AbortSignal,
): Promise<Coordinates | null> => {
  const params = buildQuery({
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'in',
    q: address,
  });
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { signal, headers: OSM_HEADERS },
  );
  if (!response.ok) return null;
  const [match] = (await response.json()) as Array<{
    lat: string;
    lon: string;
  }>;
  return match
    ? { latitude: Number(match.lat), longitude: Number(match.lon) }
    : null;
};

export const geocodeAddress = async (
  address: string,
  signal?: AbortSignal,
): Promise<Coordinates | null> => {
  if (!apiKey) return geocodeAddressOsm(address, signal);
  try {
    return (
      (await geocodeAddressGoogle(address, signal)) ??
      (await geocodeAddressOsm(address, signal))
    );
  } catch {
    return geocodeAddressOsm(address, signal);
  }
};

const geocodeAddressGoogle = async (
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

type OsmAddress = Partial<
  Record<
    | 'house_number'
    | 'road'
    | 'suburb'
    | 'neighbourhood'
    | 'city_district'
    | 'village'
    | 'town'
    | 'city'
    | 'county'
    | 'state_district'
    | 'state'
    | 'postcode',
    string
  >
>;

const reverseGeocodeOsm = async (
  coordinates: Coordinates,
  signal?: AbortSignal,
): Promise<string | null> => {
  const params = buildQuery({
    format: 'jsonv2',
    addressdetails: '1',
    lat: String(coordinates.latitude),
    lon: String(coordinates.longitude),
  });
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { signal, headers: OSM_HEADERS },
  );
  if (!response.ok) return null;
  const { address } = (await response.json()) as { address?: OsmAddress };
  if (!address) return null;
  const street = [address.house_number, address.road].filter(Boolean).join(' ');
  const locality =
    address.suburb ??
    address.neighbourhood ??
    address.city_district ??
    address.village;
  const city =
    address.city ?? address.town ?? address.county ?? address.state_district;
  const parts = [
    street,
    locality,
    city,
    address.state,
    address.postcode,
  ].filter(
    (part, index, all): part is string =>
      Boolean(part) && all.indexOf(part) === index,
  );
  return parts.length ? parts.join(', ') : null;
};

export const reverseGeocode = async (
  coordinates: Coordinates,
  signal?: AbortSignal,
): Promise<string | null> => {
  if (!apiKey) return reverseGeocodeOsm(coordinates, signal);
  try {
    return (
      (await reverseGeocodeGoogle(coordinates, signal)) ??
      (await reverseGeocodeOsm(coordinates, signal))
    );
  } catch {
    return reverseGeocodeOsm(coordinates, signal);
  }
};

const reverseGeocodeGoogle = async (
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
