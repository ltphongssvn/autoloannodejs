// frontend/src/services/cable.test.ts
import { cable } from './cable';

let mockWs: {
  readyState: number;
  send: jest.Mock;
  close: jest.Mock;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
};

const WS_OPEN = 1;
const WS_CLOSED = 3;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  localStorage.clear();

  mockWs = {
    readyState: WS_OPEN,
    send: jest.fn(),
    close: jest.fn(),
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
  };

  (global as unknown as Record<string, unknown>).WebSocket = jest.fn(() => mockWs) as unknown;
  (WebSocket as unknown as Record<string, number>).OPEN = WS_OPEN;

  cable.disconnect();
});

afterEach(() => {
  jest.useRealTimers();
  cable.disconnect();
});

describe('CableService', () => {
  it('does not connect without auth token', () => {
    cable.connect();
    expect(global.WebSocket).not.toHaveBeenCalled();
  });

  it('connects with auth token', () => {
    localStorage.setItem('authToken', 'tok123');
    cable.connect();
    expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('token=tok123'));
  });

  it('subscribes to a channel', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();

    const handler = jest.fn();
    cable.subscribe('ApplicationChannel', { id: 1 }, handler);

    mockWs.readyState = WS_OPEN;
    mockWs.onopen?.();

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('ApplicationChannel'),
    );
  });

  it('delivers messages to subscribers', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();

    const handler = jest.fn();
    cable.subscribe('AppChannel', {}, handler);
    mockWs.onopen?.();

    const identifier = JSON.stringify({ channel: 'AppChannel' });
    mockWs.onmessage?.({
      data: JSON.stringify({ identifier, message: { status: 'approved' } }),
    });

    expect(handler).toHaveBeenCalledWith({ status: 'approved' });
  });

  it('ignores ping messages', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();

    const handler = jest.fn();
    cable.subscribe('Ch', {}, handler);
    mockWs.onopen?.();

    mockWs.onmessage?.({ data: JSON.stringify({ type: 'ping' }) });
    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribes when cleanup function is called', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();
    mockWs.onopen?.();

    const handler = jest.fn();
    const unsub = cable.subscribe('Ch', {}, handler);
    unsub();

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('unsubscribe'),
    );
  });

  it('reconnects after close with exponential backoff', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();

    mockWs.readyState = WS_CLOSED;
    mockWs.onclose?.();

    jest.advanceTimersByTime(1000);
    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });

  it('disconnects and clears reconnect timer', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();
    cable.disconnect();

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('handles malformed messages gracefully', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();
    mockWs.onopen?.();

    expect(() => {
      mockWs.onmessage?.({ data: 'not json' });
    }).not.toThrow();
  });

  it('closes on error', () => {
    localStorage.setItem('authToken', 'tok');
    cable.connect();
    mockWs.onerror?.();

    expect(mockWs.close).toHaveBeenCalled();
  });
});
