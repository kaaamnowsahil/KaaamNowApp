/**
 * One WebSocket per tab that tells screens when server data changed, so they refetch at once
 * instead of waiting for a manual refresh. It carries only topic names; screens still load data
 * through the normal API. Connects only while a screen listens, reconnects with backoff, and
 * after a reconnect tells every listener to refetch (changes may have been missed meanwhile).
 */

export type RealtimeTopic = 'shifts' | 'live_requests';

type Listener = () => void;

type SocketLike = {
  send: (data: string) => void;
  close: () => void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: { code: number }) => void) | null;
};

export type RealtimeDeps = {
  url: () => string;
  token: () => string | null | undefined;
  openSocket: (url: string) => SocketLike;
};

const MAX_RETRY_MS = 30_000;
/** The server ends each session after a few minutes; reconnect right away. */
const CLOSE_RECONNECT = 4000;

export function createRealtimeClient(deps: RealtimeDeps) {
  const listeners = new Map<RealtimeTopic, Set<Listener>>();
  let socket: SocketLike | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  let hadSession = false;

  const listening = () => [...listeners.values()].some(set => set.size > 0);

  const emit = (topic?: RealtimeTopic) => {
    for (const [key, set] of listeners) {
      if (!topic || key === topic) for (const listener of [...set]) listener();
    }
  };

  const scheduleReconnect = (delay: number) => {
    if (retryTimer !== undefined || !listening()) return;
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      connect();
    }, delay);
  };

  function connect() {
    if (socket || !listening()) return;
    const token = deps.token();
    if (!token) return;
    const current = deps.openSocket(deps.url());
    socket = current;
    current.onopen = () =>
      current.send(JSON.stringify({ type: 'auth', token }));
    current.onmessage = event => {
      let message: { type?: string; topic?: RealtimeTopic };
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (message.type === 'ready') {
        attempts = 0;
        if (hadSession) emit();
        hadSession = true;
      } else if (message.type === 'changed' && message.topic) {
        emit(message.topic);
      }
    };
    current.onclose = event => {
      if (socket !== current) return;
      socket = null;
      if (event.code === CLOSE_RECONNECT) {
        scheduleReconnect(0);
        return;
      }
      attempts += 1;
      scheduleReconnect(Math.min(MAX_RETRY_MS, 1000 * 2 ** (attempts - 1)));
    };
  }

  function stop() {
    if (retryTimer !== undefined) clearTimeout(retryTimer);
    retryTimer = undefined;
    const current = socket;
    socket = null;
    current?.close();
  }

  return {
    subscribe(topic: RealtimeTopic, listener: Listener) {
      const set = listeners.get(topic) ?? new Set<Listener>();
      set.add(listener);
      listeners.set(topic, set);
      connect();
      return () => {
        set.delete(listener);
        if (!listening()) {
          stop();
          hadSession = false;
        }
      };
    },
    /** New token, or the app came back to the foreground / online: reconnect now. */
    reconnect() {
      stop();
      attempts = 0;
      connect();
    },
    /** Reconnect only if the socket is down (e.g. retries are backing off). */
    wake() {
      if (socket) return;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      retryTimer = undefined;
      attempts = 0;
      connect();
    },
  };
}
