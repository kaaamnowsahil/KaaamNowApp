import { runtimeConfig } from '@/config/runtimeConfig';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** JSON GET/POST with timeout. Absolute URLs are used as-is; paths are joined to apiBaseUrl. */
export const http = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const url = /^https?:\/\//.test(path)
    ? path
    : `${runtimeConfig.apiBaseUrl}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    runtimeConfig.requestTimeoutMs,
  );
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new HttpError(res.status, `${res.status} ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
};
