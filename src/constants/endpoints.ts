/** Backend API paths, relative to runtimeConfig.apiBaseUrl. */
export const ENDPOINTS = {
  workTypes: '/api/v1/categories',
  businessTypes: '/api/v1/business-types',
} as const;

/** OpenStreetMap reverse geocoding (dev). Swap for a keyed provider in production. */
export const reverseGeocodeUrl = (lat: number, lng: number) =>
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
