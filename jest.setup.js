/* eslint-env jest */
/* Native modules have no JS implementation under Jest; these stand-ins keep imports working. */
const mockMemory = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async key =>
      mockMemory.has(key) ? mockMemory.get(key) : null,
    ),
    setItem: jest.fn(async (key, value) => {
      mockMemory.set(key, value);
    }),
    removeItem: jest.fn(async key => {
      mockMemory.delete(key);
    }),
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
  deleteToken: jest.fn(),
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(async () => null),
  onTokenRefresh: jest.fn(() => jest.fn()),
  requestPermission: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => false),
  setGenericPassword: jest.fn(async () => true),
  resetGenericPassword: jest.fn(async () => true),
}));
