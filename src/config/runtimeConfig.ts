import { Platform } from 'react-native';

/** Android emulator reaches the host machine via 10.0.2.2; iOS simulator via localhost. */
const DEV_API_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const runtimeConfig = {
  apiBaseUrl: DEV_API_HOST,
  requestTimeoutMs: 8000,
} as const;
