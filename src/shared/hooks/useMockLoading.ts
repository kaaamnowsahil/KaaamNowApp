import { useEffect, useState } from 'react';

/** Mock data has no network wait; this keeps the loader visible briefly so screens behave like they will with the API. */
export const MOCK_LOAD_MS = 700;

export const useMockLoading = (delayMs = MOCK_LOAD_MS) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return isLoading;
};
