import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api/apiClient';

type ApiQueryOptions = {
  /** Silently reloads on this interval while the screen is focused. */
  pollIntervalMs?: number;
};

/** Loads on mount and whenever the screen regains focus; the loader shows only until the first result. */
export const useApiQuery = <T>(
  load: () => Promise<T>,
  deps: unknown[],
  { pollIntervalMs }: ApiQueryOptions = {},
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestId = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    const id = ++requestId.current;
    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    try {
      const result = await loadRef.current();
      if (id !== requestId.current) return;
      setData(result);
      setError('');
    } catch (cause) {
      if (id !== requestId.current) return;
      setError(errorMessage(cause));
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      run('silent');
    }, [run]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!pollIntervalMs) return undefined;
      const timer = setInterval(() => run('silent'), pollIntervalMs);
      return () => clearInterval(timer);
    }, [pollIntervalMs, run]),
  );

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    reload: () => run('refresh'),
    setData,
  };
};
