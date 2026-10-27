import { apiBaseUrl, refreshAuthTokens } from '@/services/auth/authApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { tr } from '@/services/i18n/tr';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly details: unknown = null,
    readonly requestId: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Per-field messages from `details.fields`, when the server sent a field map. */
  get fieldErrors(): Record<string, string> {
    const fields = (this.details as { fields?: unknown } | null)?.fields;
    return fields && typeof fields === 'object' && !Array.isArray(fields)
      ? (fields as Record<string, string>)
      : {};
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | null | undefined>;

const REQUEST_TIMEOUT_MS = 20000;

let refreshing: Promise<string | null> | null = null;

/** One refresh at a time; concurrent 401s wait for the same new token. */
const refreshAccessToken = () => {
  refreshing ??= (async () => {
    const { tokens, phone, role, signIn, signOut } = useAuthStore.getState();
    if (!tokens?.refresh_token || !phone || !role) return null;
    try {
      const next = await refreshAuthTokens(tokens.refresh_token);
      await signIn({ phone, role, tokens: next });
      return next.access_token;
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 400 || status === 401) await signOut();
      return null;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

const buildUrl = (path: string, query?: Query) => {
  const params = Object.entries(query ?? {})
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return `${apiBaseUrl}${path}${params ? `?${params}` : ''}`;
};

const send = async (
  method: Method,
  url: string,
  body: unknown,
  accessToken: string | undefined,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const isForm = body instanceof FormData;
  try {
    return await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body === undefined || isForm
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(tr('errors.unreachable'), 'network_error', 0);
  } finally {
    clearTimeout(timer);
  }
};

export async function apiRequest<T>(
  method: Method,
  path: string,
  options: { query?: Query; body?: unknown } = {},
): Promise<T> {
  const url = buildUrl(path, options.query);
  let response = await send(
    method,
    url,
    options.body,
    useAuthStore.getState().tokens?.access_token,
  );
  if (response.status === 401) {
    const accessToken = await refreshAccessToken();
    if (accessToken)
      response = await send(method, url, options.body, accessToken);
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
    detail?: unknown;
    details?: unknown;
    request_id?: string;
  };
  if (!response.ok) {
    throw new ApiError(
      payload.message ||
        (typeof payload.detail === 'string' ? payload.detail : '') ||
        tr('errors.generic'),
      payload.code || 'request_failed',
      response.status,
      payload.details ?? null,
      payload.request_id ?? response.headers.get('x-request-id'),
    );
  }
  return payload as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : tr('errors.generic');
