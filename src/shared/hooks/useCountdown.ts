import { useCallback, useEffect, useState } from 'react';

/** Seconds remaining until `seconds` from the last restart; ticks once per second. */
export const useCountdown = (seconds: number) => {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));

  useEffect(() => {
    if (remaining === 0) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const restart = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setDeadline(t + seconds * 1000);
  }, [seconds]);

  return { remaining, restart };
};
