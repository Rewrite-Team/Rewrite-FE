import { fetchEventSource } from '@microsoft/fetch-event-source';

import { connectEventStream, type EventStreamOptions } from './eventStreamClient';
import { notifyAuthSessionExpired } from '../base/client';

jest.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: jest.fn(),
}));

jest.mock('../base/client', () => ({
  notifyAuthSessionExpired: jest.fn(),
}));

jest.mock('../base/config', () => ({
  getClientApiBaseUrl: () => 'https://api.example.com',
}));

const mockFetchEventSource = jest.mocked(fetchEventSource);
const streamControllers: AbortController[] = [];
const originalFetch = globalThis.fetch;
const streamResponse = {
  ok: true,
  headers: { get: () => 'text/event-stream' },
} as unknown as Response;

const openStream = async (overrides: Partial<EventStreamOptions> = {}) => {
  const controller = new AbortController();
  streamControllers.push(controller);
  void connectEventStream('/cover-letters/stream', {
    signal: controller.signal,
    onmessage: jest.fn(),
    refreshAuth: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  return mockFetchEventSource.mock.calls[mockFetchEventSource.mock.calls.length - 1][1];
};

describe('connectEventStream', () => {
  beforeEach(() => {
    mockFetchEventSource.mockReset();
    mockFetchEventSource.mockImplementation(() => new Promise(() => {}));
    jest.mocked(notifyAuthSessionExpired).mockClear();
    globalThis.fetch = jest.fn().mockResolvedValue(streamResponse);
  });

  afterEach(() => {
    streamControllers.splice(0).forEach((controller) => controller.abort());
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
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

  it('백오프는 상한을 유지하고 정상 메시지를 처리한 뒤 초기화한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const options = await openStream({ maxRetryDelayMs: 120_000 });
    const delays = Array.from({ length: 8 }, () => options.onerror?.(new TypeError('단절')));
    expect(delays).toEqual([1500, 3000, 6000, 12_000, 24_000, 48_000, 90_000, 90_000]);
    options.onmessage?.({ event: 'heartbeat', data: '', id: '' });
    expect(options.onerror?.(new TypeError('단절'))).toBe(1500);
  });

  it('탭 복귀 후 이전 구독이 늦게 종료돼도 새 구독을 유지하고 이탈 시 정리한다', async () => {
    const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    let finishPrevious: () => void = () => {};
    mockFetchEventSource.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishPrevious = resolve;
        })
    );
    const onmessage = jest.fn();
    const first = await openStream({ onmessage });
    expect(first.openWhenHidden).toBe(true);
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(first.signal?.aborted).toBe(true);

    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    const second = mockFetchEventSource.mock.calls[1][1];
    finishPrevious();
    await Promise.resolve();
    expect(second.signal?.aborted).toBe(false);
    first.onmessage?.({ event: 'changed', data: '{}', id: '' });
    expect(onmessage).not.toHaveBeenCalled();
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mockFetchEventSource).toHaveBeenCalledTimes(2);

    streamControllers[0].abort();
    expect(second.signal?.aborted).toBe(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mockFetchEventSource).toHaveBeenCalledTimes(2);
  });

  it('숨겨진 탭에서 시작하면 보일 때만 연결하고 정상 종료 후에는 다시 연결하지 않는다', async () => {
    const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    mockFetchEventSource.mockResolvedValueOnce(undefined);
    const controller = new AbortController();
    streamControllers.push(controller);
    const task = connectEventStream('/cover-letters/stream', {
      signal: controller.signal,
      onmessage: jest.fn(),
      refreshAuth: jest.fn(),
    });
    expect(mockFetchEventSource).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    await task;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mockFetchEventSource).toHaveBeenCalledTimes(1);
  });

  it('HTTP 복구가 끝나기 전에는 재연결 요청을 보내지 않는다', async () => {
    let finishRecovery: () => void = () => {};
    const recovery = new Promise<void>((resolve) => {
      finishRecovery = resolve;
    });
    const options = await openStream({ onRetry: () => recovery });
    options.onerror?.(new TypeError('단절'));
    const nextRequest = options.fetch!('https://api.example.com/stream', {
      signal: options.signal,
    });
    await Promise.resolve();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    finishRecovery();
    await nextRequest;
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('복구로 구독이 종료되면 대기 중이던 재연결 요청을 보내지 않는다', async () => {
    let finishRecovery: () => void = () => {};
    const recovery = new Promise<void>((resolve) => {
      finishRecovery = resolve;
    });
    const options = await openStream({
      onRetry: async () => {
        await recovery;
        streamControllers[0].abort();
      },
    });
    options.onerror?.(new TypeError('단절'));
    const nextRequest = options.fetch!('https://api.example.com/stream', {
      signal: options.signal,
    });
    const outcome = nextRequest.catch((error: unknown) => error);
    finishRecovery();
    await outcome;
    expect(options.signal?.aborted).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('이전 요청이 탭 복귀 후 실패해도 새 연결의 무응답 감시를 유지한다', async () => {
    jest.useFakeTimers();
    const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    let rejectPrevious: (error: Error) => void = () => {};
    jest.mocked(globalThis.fetch).mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) => {
          rejectPrevious = reject;
        })
    );
    const first = await openStream();
    const previousRequest = first.fetch!('https://api.example.com/stream', {
      signal: first.signal,
    });
    const previousOutcome = previousRequest.catch((error: unknown) => error);
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    const second = mockFetchEventSource.mock.calls[1][1];
    await second.fetch!('https://api.example.com/stream', { signal: second.signal });
    await second.onopen?.(streamResponse);
    const currentSignal = jest.mocked(globalThis.fetch).mock.calls[1][1]?.signal;

    const error = new Error('이전 요청 취소');
    rejectPrevious(error);
    await previousOutcome;
    expect(() => first.onerror?.(error)).toThrow();
    first.onclose?.();
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(30_000);
    expect(currentSignal?.aborted).toBe(true);
  });
});
