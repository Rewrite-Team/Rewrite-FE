'use client';

import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source';

import { getClientApiBaseUrl } from './config';

/** SSE 연결의 이벤트 처리, 인증 갱신, 취소 동작을 지정합니다. */
export interface EventStreamOptions {
  /** 화면이나 구독 대상이 사라질 때 연결을 닫는 신호입니다. */
  signal: AbortSignal;
  /** 수신한 이름 있는 이벤트와 기본 message 이벤트를 처리합니다. */
  onmessage: (message: EventSourceMessage) => void;
  /** 401 응답에서 쿠키 인증을 갱신합니다. 갱신 요청은 보통 `refreshAuthTokens`를 전달합니다. */
  refreshAuth: () => Promise<unknown>;
}

class EventStreamHttpError extends Error {
  constructor(readonly status: number) {
    super(`SSE 요청에 실패했습니다. (${status})`);
    this.name = 'EventStreamHttpError';
  }
}

class EventStreamProtocolError extends Error {
  constructor() {
    super('SSE 응답의 Content-Type이 text/event-stream이 아닙니다.');
    this.name = 'EventStreamProtocolError';
  }
}

class EventStreamHandlerError extends Error {
  constructor(readonly originalError: unknown) {
    super('SSE 이벤트 처리 중 오류가 발생했습니다.');
    this.name = 'EventStreamHandlerError';
  }
}

class AuthRefreshError extends Error {
  constructor(readonly originalError: unknown) {
    super('SSE 재연결을 위한 인증 갱신에 실패했습니다.');
    this.name = 'AuthRefreshError';
  }
}

/**
 * ## connectEventStream
 *
 * @description
 * 브라우저에서 인증 쿠키를 포함해 SSE 연결을 엽니다. 401 응답이면 전달받은 인증 갱신 함수를 한 번 호출한 뒤
 * 라이브러리의 재시도 흐름으로 다시 연결합니다. 다른 4xx 응답은 재시도하지 않고, 네트워크 오류와 5xx 응답은
 * 라이브러리 기본 재시도 정책을 따릅니다.
 *
 * 연결은 서버가 닫거나 `signal`이 abort될 때까지 유지됩니다. 상대 경로는 `NEXT_PUBLIC_API_BASE_URL` 기준으로 해석합니다.
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
  { signal, onmessage, refreshAuth }: EventStreamOptions
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('SSE 연결은 브라우저에서만 사용할 수 있습니다.');
  }

  if (signal.aborted) {
    return;
  }

  let hasRefreshedAfterUnauthorized = false;
  let refreshRequest: Promise<unknown> | undefined;

  const fetchAfterAuthRefresh: typeof fetch = async (input, init) => {
    if (refreshRequest) {
      try {
        await refreshRequest;
      } catch (error) {
        throw new AuthRefreshError(error);
      } finally {
        refreshRequest = undefined;
      }
    }

    return fetch(input, init);
  };

  await fetchEventSource(new URL(path, getClientApiBaseUrl()).toString(), {
    credentials: 'include',
    fetch: fetchAfterAuthRefresh,
    headers: { Accept: 'text/event-stream' },
    signal,
    async onopen(response) {
      if (!response.ok) {
        throw new EventStreamHttpError(response.status);
      }

      if (!response.headers.get('content-type')?.toLowerCase().startsWith('text/event-stream')) {
        throw new EventStreamProtocolError();
      }

      hasRefreshedAfterUnauthorized = false;
    },
    onmessage(message) {
      try {
        onmessage(message);
      } catch (error) {
        throw new EventStreamHandlerError(error);
      }
    },
    onerror(error) {
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

        if (error.status < 500) {
          throw error;
        }
      }
    },
  });
}
