import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';

import { apiBaseUrl } from '@/services/auth/authApi';

type AppVersionModule = {
  version?: unknown;
  getVersion?: () => Promise<unknown>;
};

const nativeVersion = (): string => {
  const version = (NativeModules.AppVersion as AppVersionModule | undefined)?.version;
  return typeof version === 'string' ? version : '';
};

const readNativeVersion = async (): Promise<string> => {
  const installed = nativeVersion();
  if (installed) return installed;
  const getVersion = (NativeModules.AppVersion as AppVersionModule | undefined)?.getVersion;
  if (!getVersion) return '';
  try {
    const value = await getVersion();
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
};

const readApiVersion = async (): Promise<string> => {
  const origin = apiBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  try {
    const response = await fetch(`${origin}/`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return '';
    const body = (await response.json()) as { version?: unknown };
    return typeof body.version === 'string' ? body.version : '';
  } catch {
    return '';
  }
};

let pending: Promise<string> | null = null;

/** Installed app version, then the API version if the native value is not linked yet. */
export function loadAppVersion(): Promise<string> {
  if (pending) return pending;
  pending = readNativeVersion()
    .then((installed) => installed || readApiVersion())
    .then((value) => {
      if (!value) pending = null;
      return value;
    });
  return pending;
}

export function useAppVersion() {
  const [version, setVersion] = useState(nativeVersion);

  useEffect(() => {
    if (version) return undefined;
    let current = true;
    void loadAppVersion().then((value) => {
      if (current && value) setVersion(value);
    });
    return () => {
      current = false;
    };
  }, [version]);

  return version;
}
