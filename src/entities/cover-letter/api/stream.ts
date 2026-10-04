import { connectEventStream, type EventStreamOptions } from '@/shared/api/eventStreamClient';

/** SSE 연결에서 사용하는 자기소개서 첨삭 상태 스트림 경로를 반환합니다. */
export const getStreamCoverLetterReviewStatusesUrl = () => '/cover-letters/stream';

/**
 * 현재 사용자의 자기소개서 첨삭 상태 스트림을 구독합니다.
 *
 * @param options - 스트림 이벤트 처리, 취소 신호, 401 인증 갱신 설정입니다.
 * @returns 스트림이 종료되거나 취소되면 완료되는 Promise입니다.
 * @example
 * ```ts
 * const controller = new AbortController();
 * await connectCoverLetterReviewStatuses({
 *   signal: controller.signal,
 *   refreshAuth: refreshAuthTokens,
 *   onmessage: ({ event, data }) => handleReviewStatus(event, data),
 * });
 * ```
 */
export const connectCoverLetterReviewStatuses = (options: EventStreamOptions) =>
  connectEventStream(getStreamCoverLetterReviewStatusesUrl(), options);
