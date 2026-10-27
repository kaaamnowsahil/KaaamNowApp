import * as Keychain from 'react-native-keychain';

import { apiBaseUrl } from '@/services/auth/authApi';
import { tr } from '@/services/i18n/tr';
import type { DeletionRequest } from '@/types';

export class AccountDeletionApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'AccountDeletionApiError';
  }
}

const REQUEST_PATH = '/me/deletion-requests';
const REQUEST_MARKER_SERVICE = 'in.kaaamnow.app.account-deletion-request';

async function request<T>(
  path: string,
  accessToken: string,
  method: 'GET' | 'POST',
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new AccountDeletionApiError(tr('errors.unreachable'), 0);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new AccountDeletionApiError(
      payload.message || tr('errors.deletionUpdateFailed'),
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const getCurrentDeletionRequest = (accessToken: string) =>
  request<DeletionRequest | null>(
    `${REQUEST_PATH}/current`,
    accessToken,
    'GET',
  );

export const submitDeletionRequest = (accessToken: string) =>
  request<DeletionRequest | null>(REQUEST_PATH, accessToken, 'POST');

export async function markDeletionRequestSubmitted(
  phone: string,
  role: string,
): Promise<void> {
  await Keychain.setGenericPassword(
    'deletion-request',
    JSON.stringify({ phone, role }),
    { service: REQUEST_MARKER_SERVICE },
  );
}

export async function hasSubmittedDeletionRequest(
  phone: string | null,
  role: string | null,
): Promise<boolean> {
  if (!phone || !role) return false;
  try {
    const saved = await Keychain.getGenericPassword({
      service: REQUEST_MARKER_SERVICE,
    });
    if (!saved) return false;
    const marker = JSON.parse(saved.password) as {
      phone?: string;
      role?: string;
    };
    return marker.phone === phone && marker.role === role;
  } catch {
    return false;
  }
}
