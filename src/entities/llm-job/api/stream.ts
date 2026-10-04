import { connectEventStream, type EventStreamOptions } from '@/shared/api/eventStreamClient';

/** SSE 연결에서 사용하는 LLM Job 이벤트 스트림 경로를 반환합니다. */
export const getStreamLlmJobEventsUrl = (jobId: string) => `/llm-jobs/${jobId}/stream`;

/**
 * 지정한 LLM Job의 이벤트 스트림을 구독합니다.
 *
 * @param jobId - 구독할 LLM Job의 식별자입니다.
 * @param options - 스트림 이벤트 처리, 취소 신호, 401 인증 갱신 설정입니다.
 * @returns 스트림이 종료되거나 취소되면 완료되는 Promise입니다.
 * @example
 * ```ts
 * const controller = new AbortController();
 * await connectLlmJobEvents(jobId, {
 *   signal: controller.signal,
 *   refreshAuth: refreshAuthTokens,
 *   onmessage: ({ event, data }) => handleJobEvent(event, data),
 * });
 * ```
 */
export const connectLlmJobEvents = (jobId: string, options: EventStreamOptions) =>
  connectEventStream(getStreamLlmJobEventsUrl(jobId), options);
