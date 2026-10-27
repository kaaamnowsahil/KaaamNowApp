import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import { getDevicePosition, type DevicePosition } from '@/services/maps/devicePosition';

/** Well inside the backend's 5-minute location freshness window. */
export const HEARTBEAT_INTERVAL_MS = 60_000;

export type HeartbeatStatus = 'idle' | 'ok' | 'no_location';

type HeartbeatDeps = {
  getPosition: () => Promise<DevicePosition | null>;
  send: (point: DevicePosition) => Promise<{ is_available: boolean }>;
  onStatus: (status: HeartbeatStatus) => void;
  onOffline: () => void;
  intervalMs?: number;
};

/** Sends the device location now and on every interval; returns `beat` and `stop`. */
export const startLocationHeartbeat = ({
  getPosition,
  send,
  onStatus,
  onOffline,
  intervalMs = HEARTBEAT_INTERVAL_MS,
}: HeartbeatDeps) => {
  let stopped = false;
  const beat = async () => {
    const point = await getPosition();
    if (stopped) return;
    if (!point) {
      onStatus('no_location');
      return;
    }
    try {
      const response = await send(point);
      if (stopped) return;
      onStatus('ok');
      if (!response.is_available) onOffline();
    } catch {
      // Network blips: the next beat retries; the location just ages meanwhile.
    }
  };
  beat().catch(() => undefined);
  const timer = setInterval(() => {
    beat().catch(() => undefined);
  }, intervalMs);
  return {
    beat,
    stop: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
};

/**
 * While the worker is LIVE (app in the foreground), keep their location fresh so
 * Businesses can find and dispatch them.
 */
export const useLocationHeartbeat = (isAvailable: boolean, onOffline: () => void) => {
  const [status, setStatus] = useState<HeartbeatStatus>('idle');

  useEffect(() => {
    if (!isAvailable) {
      setStatus('idle');
      return;
    }
    const heartbeat = startLocationHeartbeat({
      getPosition: () => getDevicePosition(8000),
      send: liveWorkApi.reportWorkerLocation,
      onStatus: setStatus,
      onOffline,
    });
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') heartbeat.beat().catch(() => undefined);
    });
    return () => {
      heartbeat.stop();
      subscription.remove();
    };
    // onOffline is a setter-style callback; re-subscribing on identity change would reset the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable]);

  return status;
};
