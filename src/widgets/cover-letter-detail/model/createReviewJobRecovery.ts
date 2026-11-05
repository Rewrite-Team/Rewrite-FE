import type { CoverLetterDetailResponse } from '@/entities/cover-letter';
import { getLlmJobStatus, llmJobQueryKeys, type LlmJobStateResponse } from '@/entities/llm-job';
import { withStreamRecoveryTimeout } from '@/shared/api/stream/withStreamRecoveryTimeout';

import { REVIEW_RESULT_REFRESH_ERROR_MESSAGE } from './reviewJobMessages';

import type { QueryClient } from '@tanstack/react-query';

interface ReviewJobRecoveryOptions {
  jobId: string;
  queryClient: QueryClient;
  controller: AbortController;
  refreshDetail: () => Promise<CoverLetterDetailResponse | undefined>;
  onConnectionIssue: (message: string) => void;
}

export const isTerminalJobStatus = (status: LlmJobStateResponse['status']) =>
  status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED';

/**
 * 구독 하나의 HTTP 복구 요청을 공유하고, 복구 중 발생한 스트림 종료도 유지합니다.
 * Job 조회 실패 시 상세 조회로 복구하며, 완료 상태가 확인되면 구독을 종료합니다.
 */
export function createReviewJobRecovery({
  jobId,
  queryClient,
  controller,
  refreshDetail,
  onConnectionIssue,
}: ReviewJobRecoveryOptions) {
  let hasStreamClosed = false;
  let recoveryPromise: Promise<void> | undefined;

  const finishTerminalRecovery = async () => {
    try {
      await refreshDetail();
    } catch {
      if (!controller.signal.aborted) onConnectionIssue(REVIEW_RESULT_REFRESH_ERROR_MESSAGE);
    } finally {
      // 결과 조회가 시간 초과돼도 종료가 확인된 Job에 다시 연결하지 않습니다.
      controller.abort();
    }
  };

  return (isStreamClosed: boolean) => {
    // 요청을 공유하더라도 뒤늦게 전달된 연결 종료 사실은 유지합니다.
    hasStreamClosed ||= isStreamClosed;
    if (controller.signal.aborted || recoveryPromise) return recoveryPromise;
    let hasRecoveredRunningJob = false;
    recoveryPromise = (async () => {
      try {
        const state = await withStreamRecoveryTimeout(controller.signal, (signal) =>
          getLlmJobStatus(jobId, { signal })
        );
        if (controller.signal.aborted) return;
        queryClient.setQueryData(llmJobQueryKeys.status(jobId), state);
        if (!isTerminalJobStatus(state.status)) {
          hasRecoveredRunningJob = true;
          return;
        }
        await finishTerminalRecovery();
      } catch {
        if (controller.signal.aborted) return;
        try {
          const detail = await refreshDetail();
          if (detail && detail.coverLetter.displayStatus !== 'REVIEWING') {
            controller.abort();
            return;
          }
        } catch {
          /* 아래 안내로 수동 복구를 제공합니다. */
        }
        if (!controller.signal.aborted)
          onConnectionIssue('진행 상태를 불러오지 못했습니다. 상태를 새로고침해 주세요.');
      }
    })().finally(() => {
      recoveryPromise = undefined;
      // 복구 도중 연결이 닫힌 경우도 완료 시점의 상태로 판단합니다.
      if (hasStreamClosed && hasRecoveredRunningJob && !controller.signal.aborted) {
        onConnectionIssue('진행 상태 연결이 종료되었습니다. 상태를 새로고침해 주세요.');
      }
    });
    return recoveryPromise;
  };
}
