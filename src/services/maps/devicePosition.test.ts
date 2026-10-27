import { PermissionsAndroid, Platform } from 'react-native';

const mockGetCurrentPosition = jest.fn();
const mockSetConfiguration = jest.fn();
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: (...args: unknown[]) => mockGetCurrentPosition(...args),
    setRNConfiguration: (...args: unknown[]) => mockSetConfiguration(...args),
  },
}));

const { FINE, COARSE } = {
  FINE: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  COARSE: PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
};
const GRANTED = PermissionsAndroid.RESULTS.GRANTED;
const DENIED = PermissionsAndroid.RESULTS.DENIED;

type Options = { enableHighAccuracy: boolean };
const fix = { coords: { latitude: 12.8448, longitude: 80.1993 } };

describe('getDevicePosition (Android)', () => {
  let getDevicePosition: typeof import('./devicePosition').getDevicePosition;
  let requestMultiple: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    mockGetCurrentPosition.mockReset();
    mockSetConfiguration.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    requestMultiple = jest.spyOn(PermissionsAndroid, 'requestMultiple');
    getDevicePosition = require('./devicePosition').getDevicePosition;
  });

  afterEach(() => requestMultiple.mockRestore());

  it('uses the fused (Play Services) provider', () => {
    expect(mockSetConfiguration).toHaveBeenCalledWith({
      skipPermissionRequests: false,
      locationProvider: 'playServices',
    });
  });

  it('accepts "Approximate" (coarse-only) permission', async () => {
    requestMultiple.mockResolvedValue({ [FINE]: DENIED, [COARSE]: GRANTED });
    mockGetCurrentPosition.mockImplementation((ok: (p: typeof fix) => void) => ok(fix));
    await expect(getDevicePosition()).resolves.toEqual({ latitude: 12.8448, longitude: 80.1993 });
  });

  it('returns null when every location permission is denied', async () => {
    requestMultiple.mockResolvedValue({ [FINE]: DENIED, [COARSE]: DENIED });
    await expect(getDevicePosition()).resolves.toBeNull();
    expect(mockGetCurrentPosition).not.toHaveBeenCalled();
  });

  it('falls back to GPS when the quick network fix fails (emulator case)', async () => {
    requestMultiple.mockResolvedValue({ [FINE]: GRANTED, [COARSE]: GRANTED });
    mockGetCurrentPosition.mockImplementation(
      (ok: (p: typeof fix) => void, fail: () => void, options: Options) =>
        options.enableHighAccuracy ? ok(fix) : fail(),
    );
    await expect(getDevicePosition()).resolves.toEqual({ latitude: 12.8448, longitude: 80.1993 });
    expect(mockGetCurrentPosition.mock.calls.map(([, , o]) => o.enableHighAccuracy)).toEqual([
      false,
      true,
    ]);
  });

  it('returns null when neither attempt gets a fix', async () => {
    requestMultiple.mockResolvedValue({ [FINE]: GRANTED, [COARSE]: GRANTED });
    mockGetCurrentPosition.mockImplementation((_: unknown, fail: () => void) => fail());
    await expect(getDevicePosition()).resolves.toBeNull();
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
  });
});
