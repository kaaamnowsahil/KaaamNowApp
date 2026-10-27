import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { ApiError } from '@/services/api/apiClient';

import { liveErrorText, secondsUntil } from './liveWorkFormat';

/**
 * Polls server state (the source of truth) and refetches as soon as the app returns to the
 * foreground, so the screen reconciles after the phone was locked or offline.
 */
export function useLivePolling<T extends { version: string }>(
  load: () => Promise<T>,
  intervalMs: number,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const loadRef = useRef(load);
  loadRef.current = load;

  const refresh = useCallback(async () => {
    try {
      const next = await loadRef.current();
      setData(current => (current?.version === next.version ? current : next));
      setError('');
      setOffline(false);
      return next;
    } catch (cause) {
      const isOffline =
        cause instanceof ApiError && cause.code === 'network_error';
      setOffline(isOffline);
      setError(isOffline ? '' : liveErrorText(cause));
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    let active = AppState.currentState === 'active';
    const timer = setInterval(() => {
      if (active) refresh().catch(() => undefined);
    }, intervalMs);
    const subscription = AppState.addEventListener('change', state => {
      active = state === 'active';
      if (active) refresh().catch(() => undefined);
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [intervalMs, refresh]);

  return { data, setData, error, offline, refresh };
}

/** Ticking seconds-left for a server deadline, corrected for device clock skew. */
export function useCountdown(
  deadline: string | null | undefined,
  serverTime?: string,
) {
  const skew = useRef(0);
  if (serverTime) skew.current = new Date(serverTime).getTime() - Date.now();
  const [left, setLeft] = useState(() => secondsUntil(deadline, skew.current));
  useEffect(() => {
    setLeft(secondsUntil(deadline, skew.current));
    if (!deadline) return;
    const timer = setInterval(
      () => setLeft(secondsUntil(deadline, skew.current)),
      1000,
    );
    return () => clearInterval(timer);
  }, [deadline]);
  return left;
}
