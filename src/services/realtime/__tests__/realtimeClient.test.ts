import { createRealtimeClient } from '../realtimeClient';

class FakeSocket {
  sent: string[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  constructor(public url: string) {}
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.closed = true;
  }
  open() {
    this.onopen?.();
  }
  receive(message: object) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
  drop(code = 1006) {
    this.onclose?.({ code });
  }
}

function nth(sockets: FakeSocket[], index: number): FakeSocket {
  const socket = sockets[index];
  if (!socket) throw new Error(`socket ${index} was not opened`);
  return socket;
}

function setup(token: string | null = 'access-1') {
  const sockets: FakeSocket[] = [];
  let currentToken = token;
  const client = createRealtimeClient({
    url: () => 'ws://api.test/api/v1/realtime',
    token: () => currentToken,
    openSocket: url => {
      const socket = new FakeSocket(url);
      sockets.push(socket);
      return socket;
    },
  });
  return {
    client,
    sockets,
    setToken: (next: string | null) => {
      currentToken = next;
    },
  };
}

describe('realtime client', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('connects on the first listener and sends the token in the first message', () => {
    const { client, sockets } = setup();
    expect(sockets).toHaveLength(0);
    client.subscribe('shifts', () => {});
    expect(sockets).toHaveLength(1);
    expect(nth(sockets, 0).url).toBe('ws://api.test/api/v1/realtime');
    nth(sockets, 0).open();
    expect(JSON.parse(nth(sockets, 0).sent[0] ?? '')).toEqual({
      type: 'auth',
      token: 'access-1',
    });
  });

  it('does not connect without a session', () => {
    const { client, sockets } = setup(null);
    client.subscribe('shifts', () => {});
    expect(sockets).toHaveLength(0);
  });

  it('routes each change to its topic only', () => {
    const { client, sockets } = setup();
    const shifts = jest.fn();
    const requests = jest.fn();
    client.subscribe('shifts', shifts);
    client.subscribe('live_requests', requests);
    nth(sockets, 0).receive({ type: 'ready' });
    nth(sockets, 0).receive({ type: 'changed', topic: 'shifts' });
    expect(shifts).toHaveBeenCalledTimes(1);
    expect(requests).not.toHaveBeenCalled();
    nth(sockets, 0).receive({ type: 'ping' });
    nth(sockets, 0).onmessage?.({ data: 'not json' });
    expect(shifts).toHaveBeenCalledTimes(1);
  });

  it('reconnects with backoff and refetches everything after reconnecting', () => {
    const { client, sockets } = setup();
    const shifts = jest.fn();
    client.subscribe('shifts', shifts);
    nth(sockets, 0).receive({ type: 'ready' });
    expect(shifts).not.toHaveBeenCalled();

    nth(sockets, 0).drop();
    jest.advanceTimersByTime(999);
    expect(sockets).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(sockets).toHaveLength(2);

    nth(sockets, 1).drop();
    jest.advanceTimersByTime(1999);
    expect(sockets).toHaveLength(2);
    jest.advanceTimersByTime(1);
    expect(sockets).toHaveLength(3);

    nth(sockets, 2).receive({ type: 'ready' });
    expect(shifts).toHaveBeenCalledTimes(1);
  });

  it('reconnects at once when the server ends the session', () => {
    const { client, sockets } = setup();
    client.subscribe('shifts', () => {});
    nth(sockets, 0).drop(4000);
    jest.advanceTimersByTime(0);
    expect(sockets).toHaveLength(2);
  });

  it('closes when the last listener leaves and stops retrying', () => {
    const { client, sockets } = setup();
    const stopA = client.subscribe('shifts', () => {});
    const stopB = client.subscribe('live_requests', () => {});
    stopA();
    expect(nth(sockets, 0).closed).toBe(false);
    stopB();
    expect(nth(sockets, 0).closed).toBe(true);
    jest.advanceTimersByTime(60_000);
    expect(sockets).toHaveLength(1);
  });

  it('reconnects with the new token', () => {
    const { client, sockets, setToken } = setup();
    client.subscribe('shifts', () => {});
    setToken('access-2');
    client.reconnect();
    expect(nth(sockets, 0).closed).toBe(true);
    nth(sockets, 1).open();
    expect(JSON.parse(nth(sockets, 1).sent[0] ?? '').token).toBe('access-2');
  });

  it('wake skips the backoff only when the socket is down', () => {
    const { client, sockets } = setup();
    client.subscribe('shifts', () => {});
    client.wake();
    expect(sockets).toHaveLength(1);
    nth(sockets, 0).drop();
    client.wake();
    expect(sockets).toHaveLength(2);
  });
});
