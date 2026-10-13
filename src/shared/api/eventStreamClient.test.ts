import { fetchEventSource } from '@microsoft/fetch-event-source';

import { notifyAuthSessionExpired } from './client';
import { connectEventStream, type EventStreamOptions } from './eventStreamClient';

jest.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: jest.fn(),
}));

jest.mock('./client', () => ({
  notifyAuthSessionExpired: jest.fn(),
}));

jest.mock('./config', () => ({
  getClientApiBaseUrl: () => 'https://api.example.com',
}));

const mockFetchEventSource = jest.mocked(fetchEventSource);

const openStream = async (overrides: Partial<EventStreamOptions> = {}) => {
  await connectEventStream('/cover-letters/stream', {
    signal: new AbortController().signal,
    onmessage: jest.fn(),
    refreshAuth: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  return mockFetchEventSource.mock.calls[mockFetchEventSource.mock.calls.length - 1][1];
};

describe('connectEventStream', () => {
  beforeEach(() => {
    mockFetchEventSource.mockReset();
    mockFetchEventSource.mockResolvedValue(undefined);
    jest.mocked(notifyAuthSessionExpired).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('네트워크 오류와 5xx 응답은 재연결 콜백을 호출한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const onRetry = jest.fn();
    const options = await openStream({ onRetry });

    expect(options.onerror?.(new Error('네트워크 오류'))).toBe(1500);
    const httpError = await Promise.resolve(
      options.onopen?.({ ok: false, status: 503 } as Response)
    ).catch((error: unknown) => error);
    expect(options.onerror?.(httpError)).toBe(3000);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('지속적인 상태 구독은 서버 종료를 재연결 대상으로 처리한다', async () => {
    const onRetry = jest.fn();
    const options = await openStream({ reconnectOnClose: true, onRetry });
    let closeError: unknown;

    try {
      options.onclose?.();
    } catch (error) {
      closeError = error;
    }

    expect(closeError).toBeInstanceOf(Error);
    options.onerror?.(closeError);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('기본 구독의 정상 종료와 abort된 구독은 재연결하지 않는다', async () => {
    const defaultOptions = await openStream();
    expect(() => defaultOptions.onclose?.()).not.toThrow();

    const controller = new AbortController();
    const options = await openStream({ signal: controller.signal, reconnectOnClose: true });
    controller.abort();
    expect(() => options.onclose?.()).not.toThrow();
  });

  it('401은 인증을 한 번 갱신하고 반복되면 세션 만료를 알리며 중단한다', async () => {
    const refreshAuth = jest.fn().mockResolvedValue(undefined);
    const onRetry = jest.fn();
    const options = await openStream({ refreshAuth, onRetry });
    const httpError = await Promise.resolve(
      options.onopen?.({ ok: false, status: 401 } as Response)
    ).catch((error: unknown) => error);

    expect(options.onerror?.(httpError)).toBe(0);
    await Promise.resolve();
    expect(refreshAuth).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(() => options.onerror?.(httpError)).toThrow();
    expect(notifyAuthSessionExpired).toHaveBeenCalledTimes(1);
  });
});
