import { Platform } from 'react-native';

import { tr } from '@/services/i18n/tr';

import type { AuthTokens } from './useAuthStore';
import type {
  BusinessSignup,
  UserRole,
  WorkerSignup,
} from '@/services/onboarding/useOnboardingStore';

declare const process: { env: { API_BASE_URL?: string } };
const API_BASE_URL = (
  process.env.API_BASE_URL || 'https://kaaamnow-backend.vercel.app/api/v1'
)
  .trim()
  .replace(/\/$/, '')
  // The Android emulator reaches the host machine at 10.0.2.2, not localhost.
  .replace(
    /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/,
    (match, scheme: string) =>
      Platform.OS === 'android' ? `${scheme}10.0.2.2` : match,
  );

export class AuthApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export type AuthResponse = {
  tokens: AuthTokens;
  is_new_user: boolean;
  needs_role_selection: boolean;
  me: {
    phone: string;
    active_role: string | null;
    roles: string[];
  };
};

type PhoneCheckResponse = {
  phone: string;
  registered: boolean;
  roles: string[];
};

async function post<T>(
  path: string,
  body: object,
  accessToken?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError(tr('errors.unreachable'), 'network_error', 0);
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
  };
  if (!response.ok) {
    throw new AuthApiError(
      payload.message || tr('errors.requestFailed'),
      payload.code || 'request_failed',
      response.status,
    );
  }
  return payload as T;
}

export async function checkPhoneForSignup(phone: string) {
  const result = await post<PhoneCheckResponse>('/auth/phone/check', { phone });
  if (result.roles.length) {
    throw new AuthApiError(
      tr('errors.phoneRegistered'),
      'phone_registered',
      409,
    );
  }
}

export const loginWithPassword = (phone: string, password: string) =>
  post<AuthResponse>('/auth/password/login', { phone, password });

export function completeSignup(input: {
  phone: string;
  code: string;
  password: string;
  role: UserRole;
  languageCode: string;
  worker?: WorkerSignup | null;
  business?: BusinessSignup | null;
}) {
  const body: Record<string, unknown> = {
    phone: input.phone,
    code: input.code,
    password: input.password,
    role: input.role,
    language_code: input.languageCode,
  };

  if (input.role === 'worker' && input.worker) {
    body.worker = {
      full_name: input.worker.fullName,
      email: input.worker.email || null,
      age: input.worker.age,
      address_text: input.worker.address,
      latitude: input.worker.location?.lat,
      longitude: input.worker.location?.lng,
      work_type_slugs: input.worker.workTypes,
    };
  } else if (input.role === 'business' && input.business) {
    body.business = {
      business_name: input.business.businessName,
      contact_name: input.business.contactName,
      email: input.business.email || null,
      address_text: input.business.address,
      latitude: input.business.location?.lat,
      longitude: input.business.location?.lng,
      business_type_slugs: input.business.businessTypes,
    };
  }

  return post<AuthResponse>('/auth/signup', body);
}

export type OtpSendResponse = {
  phone: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
  /** sms | whatsapp | voice | console */
  delivery_channel: string;
  sender_name?: string | null;
};

export const sendOtp = (
  phone: string,
  intent: 'sign_up' | 'password_reset',
  role?: UserRole,
) => post<OtpSendResponse>('/auth/otp/send', { phone, intent, role });

export const sendPasswordResetOtp = (phone: string) =>
  sendOtp(phone, 'password_reset');

export const resetPassword = (
  phone: string,
  code: string,
  newPassword: string,
) =>
  post<void>('/auth/password/reset/confirm', {
    phone,
    code,
    new_password: newPassword,
  });

export const revokeRefreshToken = (refreshToken: string, accessToken: string) =>
  post<void>('/auth/logout', { refresh_token: refreshToken }, accessToken);

export const refreshAuthTokens = (refreshToken: string) =>
  post<AuthTokens>('/auth/token/refresh', { refresh_token: refreshToken });

export const apiBaseUrl = API_BASE_URL;
