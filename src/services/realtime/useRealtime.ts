import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { apiBaseUrl } from '@/services/auth/authApi';
import { useAuthStore } from '@/services/auth/useAuthStore';

import { createRealtimeClient, type RealtimeTopic } from './realtimeClient';

type SocketLike = ReturnType<
  Parameters<typeof createRealtimeClient>[0]['openSocket']
>;

export const realtime = createRealtimeClient({
  url: () => `${apiBaseUrl.replace(/^http/, 'ws')}/realtime`,
  token: () => useAuthStore.getState().tokens?.access_token,
  openSocket: url => new WebSocket(url) as unknown as SocketLike,
});

useAuthStore.subscribe((state, previous) => {
  if (state.tokens?.access_token !== previous.tokens?.access_token) {
    realtime.reconnect();
  }
});
AppState.addEventListener('change', state => {
  if (state === 'active') realtime.wake();
});

/** Calls `onChange` whenever the server says `topic` changed (and after a reconnect). */
export function useRealtime(topic: RealtimeTopic, onChange: () => void) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(
    () => realtime.subscribe(topic, () => onChangeRef.current()),
    [topic],
  );
}
