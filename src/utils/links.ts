import { Platform } from 'react-native';

/** Opens the platform maps app searching for `query`. */
export const mapsUrl = (query: string) => {
  const q = encodeURIComponent(query);
  return Platform.OS === 'ios'
    ? `http://maps.apple.com/?q=${q}`
    : `geo:0,0?q=${q}`;
};
