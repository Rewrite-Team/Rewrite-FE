'use client';

import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source';

import {
  DEFAULT_MAX_RETRY_DELAY_MS,
  INITIAL_RETRY_DELAY_MS,
  getEventStreamBackoff,
} from './eventStreamBackoff';
import {
  AuthRefreshError,
  EventStreamHandlerError,
  EventStreamHttpError,
  EventStreamProtocolError,
} from './eventStreamErrors';
import { createMonitoredStreamRequest } from './eventStreamRequest';
import { runVisibleEventStream } from './eventStreamVisibility';
import { ApiError } from '../base/apiError';
import { notifyAuthSessionExpired } from '../base/client';
import { getClientApiBaseUrl } from '../base/config';

const DEFAULT_NO_MESSAGE_TIMEOUT_MS = 30_000;

/** SSE 연결의 이벤트 처리, 인증 갱신, 취소 동작을 지정합니다. */
export interface EventStreamOptions {
  /** 화면이나 구독 대상이 사라질 때 연결을 닫는 신호입니다. */
  signal: AbortSignal;
  /** 수신한 이름 있는 이벤트와 기본 message 이벤트를 처리합니다. */
  onmessage: (message: EventSourceMessage) => void;
  /** 401 응답에서 쿠키 인증을 갱신합니다. 갱신 요청은 보통 `refreshAuthTokens`를 전달합니다. */
  refreshAuth: () => Promise<unknown>;
  /**
   * 네트워크 오류·5xx·무응답·재연결 대상 종료 뒤 상태를 복구합니다. 반환한 Promise가 끝난 뒤 다음 요청을 보냅니다.
   * 종료 상태가 확인되면 signal 소유자가 abort해 재연결을 중단합니다. 콜백 실패 시에는 백오프 재시도를 유지합니다.
   */
  onRetry?: () => void | Promise<void>;
  /** 지속적인 상태 구독에서 서버가 연결을 종료하면 다시 연결합니다. 기본값은 false입니다. */
  reconnectOnClose?: boolean;
  /** 백오프 기준 간격의 상한입니다. 2초 이상으로 지정하며 기본값은 60초입니다. */
  maxRetryDelayMs?: number;
  /** 무응답 기준으로 기본값은 30초입니다. 서버 heartbeat 주기를 바꾸면 이 값도 더 길게 조정합니다. */
  noMessageTimeoutMs?: number;
}

/**
 * ## connectEventStream
 *
 * @description
 * 브라우저에서 인증 쿠키를 포함해 SSE 연결을 엽니다. 401 응답이면 전달받은 인증 갱신 함수를 한 번 호출한 뒤
 * 라이브러리의 재시도 흐름으로 다시 연결합니다. 갱신 후에도 401이면 세션 만료를 알리고 연결을 중단합니다.
 * 다른 4xx 응답은 재시도하지 않습니다. 네트워크 오류·5xx·재연결 대상 종료에는 2초부터
 * `maxRetryDelayMs`(기본 60초)까지 지수 백오프를 적용합니다. 동시 재접속을 분산하기 위해
 * 기준 간격의 50~100%에서 대기합니다.
 * 연결이 열린 뒤 30초 동안 이벤트가 없으면 요청을 중단해 같은 백오프 재연결 흐름으로 넘깁니다.
 * heartbeat를 포함해 이벤트를 받을 때마다 무응답 감시를 초기화합니다. 재연결 전에 실행하는 `onRetry`가
 * Promise를 반환하면 복구가 끝날 때까지 다음 HTTP 요청을 대기합니다.
 * 정상 이벤트를 처리하면 간격을 초기화합니다. 반환한 간격은 서버의 SSE `retry:` 값보다 우선합니다.
 *
 * 기본적으로 서버가 닫거나 `signal`이 abort되면 종료합니다. 지속적인 상태 구독은 `reconnectOnClose`로
 * 서버 종료 후에도 재연결할 수 있습니다. 탭이 숨겨지면 구독, 재시도, 무응답 감시 타이머를 취소하고,
 * 다시 보이면 새 구독 하나를 생성합니다. 마지막 이벤트 ID와 백오프 간격은 유지합니다. 상대 경로는 `NEXT_PUBLIC_API_BASE_URL` 기준으로 해석합니다.
 *
 * @param path - SSE 엔드포인트 경로 또는 절대 URL입니다.
 * @param options - 이벤트 처리기, 인증 갱신 함수, 연결 취소 신호입니다.
 * @returns 스트림이 정상적으로 종료되거나 취소되면 완료되는 Promise입니다.
 * @throws 인증 갱신, 이벤트 처리, 프로토콜 또는 재시도하지 않는 HTTP 오류가 발생하면 거부됩니다.
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 * await connectEventStream('/llm-jobs/job-id/stream', {
 *   signal: controller.signal,
 *   refreshAuth: refreshAuthTokens,
 *   onmessage: ({ event, data }) => handleStreamEvent(event, data),
 * });
 * ```
 */
export async function connectEventStream(
  path: string,
  {
    signal,
    onmessage,
    refreshAuth,
    onRetry,
    reconnectOnClose = false,
    maxRetryDelayMs = DEFAULT_MAX_RETRY_DELAY_MS,
    noMessageTimeoutMs = DEFAULT_NO_MESSAGE_TIMEOUT_MS,
  }: EventStreamOptions
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('SSE 연결은 브라우저에서만 사용할 수 있습니다.');
  }

  if (signal.aborted) {
    return;
  }

  let hasRefreshedAfterUnauthorized = false;
  let refreshRequest: Promise<unknown> | undefined;
  let retryRecovery: Promise<void> | undefined;
  let retryDelayMs = INITIAL_RETRY_DELAY_MS;
  let headers: Record<string, string> = { Accept: 'text/event-stream' };
  let activeRequest: ReturnType<typeof createMonitoredStreamRequest> | undefined;

  const cleanupActiveRequest = () => {
    activeRequest?.dispose();
    activeRequest = undefined;
  };

  const fetchAfterAuthRefresh: typeof fetch = async (input, init) => {
    init?.signal?.throwIfAborted();
    // 라이브러리의 onerror는 Promise를 기다리지 않으므로 실제 fetch 직전에 상태 복구 완료를 확인합니다.
    if (retryRecovery) {
      const pendingRecovery = retryRecovery;
      await pendingRecovery;
      if (retryRecovery === pendingRecovery) retryRecovery = undefined;
    }

    if (refreshRequest) {
      try {
        await refreshRequest;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          notifyAuthSessionExpired();
        }

        throw new AuthRefreshError(error);
      } finally {
        refreshRequest = undefined;
      }
    }

    // 복구 중 종료 Job이 확인되거나 구독이 취소됐으면 서버에 새 요청을 보내지 않습니다.
    init?.signal?.throwIfAborted();
    // 라이브러리가 이벤트 ID를 갱신하는 헤더 객체를 다음 구독에도 전달합니다.
    const requestHeaders = init?.headers;
    if (requestHeaders && !(requestHeaders instanceof Headers) && !Array.isArray(requestHeaders)) {
      headers = requestHeaders;
    }

    cleanupActiveRequest();
    const request = createMonitoredStreamRequest(init?.signal, noMessageTimeoutMs);
    activeRequest = request;

    try {
      return await fetch(input, { ...init, signal: request.signal });
    } catch (error) {
      request.dispose();
      // 탭 복귀 후 늦게 실패한 이전 요청이 새 요청의 감시 상태를 지우지 않도록 구분합니다.
      if (activeRequest === request) activeRequest = undefined;
      throw error;
    }
  };

  const url = new URL(path, getClientApiBaseUrl()).toString();
  const subscribe = (subscriptionSignal: AbortSignal) =>
    fetchEventSource(url, {
      credentials: 'include',
      fetch: fetchAfterAuthRefresh,
      headers,
      signal: subscriptionSignal,
      openWhenHidden: true,
      async onopen(response) {
        if (subscriptionSignal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new EventStreamHttpError(response.status);
        }

        if (!response.headers.get('content-type')?.toLowerCase().startsWith('text/event-stream')) {
          throw new EventStreamProtocolError();
        }

        hasRefreshedAfterUnauthorized = false;
        // 연결 후 첫 이벤트가 도착하지 않는 경우도 감지합니다.
        activeRequest?.recordActivity();
      },
      onmessage(message) {
        if (subscriptionSignal.aborted) {
          return;
        }

        // 화면의 업무 이벤트 파서가 무시하는 heartbeat도 정상 수신으로 처리합니다.
        activeRequest?.recordActivity();

        try {
          onmessage(message);
          // 응답 헤더만 성공하고 바로 끊기는 연결은 백오프를 유지합니다.
          retryDelayMs = INITIAL_RETRY_DELAY_MS;
        } catch (error) {
          throw new EventStreamHandlerError(error);
        }
      },
      onclose() {
        if (subscriptionSignal.aborted) return;
        cleanupActiveRequest();
        if (reconnectOnClose && !subscriptionSignal.aborted) {
          throw new Error('SSE 연결이 종료되었습니다.');
        }
      },
      onerror(error) {
        if (subscriptionSignal.aborted) {
          throw error;
        }
        cleanupActiveRequest();

        if (error instanceof AuthRefreshError || error instanceof EventStreamProtocolError) {
          throw error;
        }

        if (error instanceof EventStreamHandlerError) {
          throw error.originalError;
        }

        if (error instanceof EventStreamHttpError) {
          if (error.status === 401 && !hasRefreshedAfterUnauthorized) {
            hasRefreshedAfterUnauthorized = true;
            refreshRequest = Promise.resolve().then(refreshAuth);

            return 0;
          }

          if (error.status === 401) {
            notifyAuthSessionExpired();
          }

          if (error.status < 500) {
            throw error;
          }
        }

        // 복구 실패 안내는 호출부에서 처리하고, 일시적인 조회 실패로 SSE 재시도까지 멈추지 않게 합니다.
        try {
          retryRecovery = Promise.resolve(onRetry?.()).catch(() => undefined);
        } catch {
          retryRecovery = Promise.resolve();
        }

        const { delayMs, nextRetryDelayMs } = getEventStreamBackoff(retryDelayMs, maxRetryDelayMs);
        retryDelayMs = nextRetryDelayMs;

        return delayMs;
      },
    });

  return runVisibleEventStream(signal, subscribe);
}
