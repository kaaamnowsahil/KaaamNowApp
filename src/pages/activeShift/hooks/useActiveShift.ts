import { useEffect, useState } from 'react';

import { useMockLoading } from '@/shared/hooks/useMockLoading';

import { ACTIVE_SHIFT } from '../mock';

/** Ticks the time-on-shift clock every second once loaded. */
export const useActiveShift = () => {
  const isLoading = useMockLoading();
  const [elapsed, setElapsed] = useState(ACTIVE_SHIFT.elapsedSeconds);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLoading]);

  return { isLoading, shift: ACTIVE_SHIFT, elapsed };
};
