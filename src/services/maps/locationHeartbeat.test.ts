import { HEARTBEAT_INTERVAL_MS, startLocationHeartbeat } from './locationHeartbeat';

jest.mock('@/services/liveWork/liveWorkApi', () => ({ liveWorkApi: {} }));
jest.mock('./devicePosition', () => ({ getDevicePosition: jest.fn() }));

const flush = () => new Promise<void>(resolve => jest.requireActual('timers').setImmediate(resolve));

describe('startLocationHeartbeat', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const point = { latitude: 12.8448, longitude: 80.1993 };

  it('sends the location now and every minute until stopped', async () => {
    const send = jest.fn().mockResolvedValue({ is_available: true });
    const onStatus = jest.fn();
    const heartbeat = startLocationHeartbeat({
      getPosition: async () => point,
      send,
      onStatus,
      onOffline: jest.fn(),
    });
    await flush();
    expect(send).toHaveBeenCalledWith(point);
    expect(onStatus).toHaveBeenLastCalledWith('ok');

    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    await flush();
    expect(send).toHaveBeenCalledTimes(2);

    heartbeat.stop();
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);
    await flush();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('reports a missing location instead of pretending to be live', async () => {
    const send = jest.fn();
    const onStatus = jest.fn();
    const heartbeat = startLocationHeartbeat({
      getPosition: async () => null,
      send,
      onStatus,
      onOffline: jest.fn(),
    });
    await flush();
    expect(send).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith('no_location');
    heartbeat.stop();
  });

  it('switches the toggle off when the server says the worker is offline', async () => {
    const onOffline = jest.fn();
    const heartbeat = startLocationHeartbeat({
      getPosition: async () => point,
      send: jest.fn().mockResolvedValue({ is_available: false }),
      onStatus: jest.fn(),
      onOffline,
    });
    await flush();
    expect(onOffline).toHaveBeenCalled();
    heartbeat.stop();
  });

  it('keeps going after a network error', async () => {
    const send = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ is_available: true });
    const onStatus = jest.fn();
    const heartbeat = startLocationHeartbeat({
      getPosition: async () => point,
      send,
      onStatus,
      onOffline: jest.fn(),
    });
    await flush();
    expect(onStatus).not.toHaveBeenCalled();
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    await flush();
    expect(onStatus).toHaveBeenLastCalledWith('ok');
    heartbeat.stop();
  });
});
