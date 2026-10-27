import {
  deleteToken,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { apiRequest } from '@/services/api/apiClient';

import { registerForPush, unregisterPush } from '../pushService';

jest.mock('@/services/api/apiClient', () => ({ apiRequest: jest.fn() }));

const request = apiRequest as jest.Mock;
const permission = requestPermission as jest.Mock;
const token = getToken as jest.Mock;
const refresh = onTokenRefresh as jest.Mock;
const removeToken = deleteToken as jest.Mock;

describe('pushService', () => {
  let stopRefresh: jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();
    stopRefresh = jest.fn();
    request.mockReset().mockResolvedValue({ id: 'device-1', platform: 'ios', is_active: true });
    permission.mockReset().mockResolvedValue(1);
    token.mockReset().mockResolvedValue('fcm-token-from-firebase');
    refresh.mockReset().mockReturnValue(stopRefresh);
    removeToken.mockReset().mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await unregisterPush();
  });

  it('registers the real FCM token with the API once permission is granted', async () => {
    const stop = await registerForPush();

    expect(request).toHaveBeenCalledWith('POST', '/me/devices', {
      body: expect.objectContaining({ platform: 'ios', push_token: 'fcm-token-from-firebase' }),
    });
    expect(stop).toBe(stopRefresh);
  });

  it('re-registers when Firebase rotates the token', async () => {
    await registerForPush();
    const onRefresh = refresh.mock.calls[0][1] as (next: string) => void;
    onRefresh('rotated-token');
    await Promise.resolve();

    expect(request).toHaveBeenLastCalledWith('POST', '/me/devices', {
      body: expect.objectContaining({ push_token: 'rotated-token' }),
    });
  });

  it('does nothing when the user declines notifications', async () => {
    permission.mockResolvedValue(0);

    await expect(registerForPush()).resolves.toBeNull();
    expect(token).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('respects a denied Android 13 permission prompt', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(34);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    await expect(registerForPush()).resolves.toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it('registers as android without a prompt before Android 13', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(31);
    const prompt = jest.spyOn(PermissionsAndroid, 'request');

    await registerForPush();

    expect(prompt).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledWith('POST', '/me/devices', {
      body: expect.objectContaining({ platform: 'android' }),
    });
  });

  it('keeps listening when a rotated token cannot be saved yet', async () => {
    await registerForPush();
    request.mockRejectedValueOnce(new Error('offline'));
    const onRefresh = refresh.mock.calls[0][1] as (next: string) => void;

    expect(() => onRefresh('rotated-token')).not.toThrow();
    await Promise.resolve();
    expect(stopRefresh).not.toHaveBeenCalled();
  });

  it('fails loudly and drops the listener when the token cannot be saved (offline)', async () => {
    request.mockRejectedValue(new Error('Network request failed'));

    await expect(registerForPush()).rejects.toThrow('Network request failed');
    expect(stopRefresh).toHaveBeenCalled();
  });

  it('removes the server device and the local token on sign-out', async () => {
    await registerForPush();
    request.mockClear();

    await unregisterPush();

    expect(request).toHaveBeenCalledWith('DELETE', '/me/devices/device-1');
    expect(removeToken).toHaveBeenCalled();
  });

  it('still deletes the local token when no device was registered', async () => {
    await unregisterPush();

    expect(request).not.toHaveBeenCalled();
    expect(removeToken).toHaveBeenCalled();
  });
});
