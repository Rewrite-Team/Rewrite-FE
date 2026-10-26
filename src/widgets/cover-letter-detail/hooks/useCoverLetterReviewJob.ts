'use client';

import { useEffect, useState } from 'react';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchLatestCoverLetterDetail, coverLetterQueryKeys } from '@/entities/cover-letter';
import {
  connectLlmJobEvents,
  parseCoverLetterReviewEvent,
  mergeReviewQuestionSnapshots,
  llmJobQueryKeys,
  type LlmJobStateResponse,
  type ReviewQuestionSnapshot,
} from '@/entities/llm-job';
import { reviewVersionQueryKeys } from '@/entities/review-version';
import { refreshAuthTokens } from '@/entities/user';
import { withStreamRecoveryTimeout } from '@/shared/api/stream/withStreamRecoveryTimeout';

import { createReviewJobRecovery, isTerminalJobStatus } from '../model/createReviewJobRecovery';

/**
 * ## useCoverLetterReviewJob
 *
 * @description
 * 상세 화면에서 첨삭 Job의 SSE 상태와 문항별 중간 결과를 구독합니다.
 * 연결 오류가 발생하면 HTTP로 Job 상태를 먼저 확인한 뒤, 진행 중인 Job만 재연결합니다.
 * 스트림 종료 시에도 최종 상태를 확인하며 Job 조회 실패 시 상세 조회로 복구합니다.
 *
 * ### 주의할 점
 * jobId가 없으면 연결하지 않습니다. Job 변경이나 화면 이탈 시 기존 연결을 취소합니다.
 * retry는 연결 안내를 지우고 SSE 구독을 다시 시작합니다.
 * 자기소개서 상세 데이터의 별도 새로고침은 호출하는 화면에서 처리합니다.
 *
 * @example
 * ```tsx
 * const { jobState, questionResults, connectionIssue, retry } =
 *   useCoverLetterReviewJob(coverLetterId, jobId);
 * ```
 */
export function useCoverLetterReviewJob(coverLetterId: string, jobId?: string) {
  const queryClient = useQueryClient();
  const [subscriptionAttempt, setSubscriptionAttempt] = useState(0);
  const [connectionIssue, setConnectionIssue] = useState<{ jobId: string; message: string }>();
  const [partialQuestionResults, setPartialQuestionResults] = useState<{
    jobId: string;
    items: ReviewQuestionSnapshot[];
  }>();
  const queryKey = llmJobQueryKeys.status(jobId ?? '');
  const { data: jobState } = useQuery<LlmJobStateResponse>({
    queryKey,
    // SSE와 복구 요청이 갱신한 캐시만 구독해 별도 자동 조회를 방지합니다.
    queryFn: skipToken,
  });

  useEffect(() => {
    if (!jobId) return;
    const controller = new AbortController();
    const jobQueryKey = llmJobQueryKeys.status(jobId);
    let hasReceivedTerminalState = false;

    const refreshDetail = async () => {
      // 완료·복구 시에는 신선한 REVIEWING 캐시가 있어도 서버의 최신 결과를 조회합니다.
      const detail = await withStreamRecoveryTimeout(controller.signal, (signal) =>
        fetchLatestCoverLetterDetail(queryClient, coverLetterId, signal)
      );
      if (controller.signal.aborted) return;
      void queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: reviewVersionQueryKeys.list(coverLetterId) });
      if (detail.coverLetter.displayStatus === 'REVIEWING') {
        setConnectionIssue({
          jobId,
          message: '최신 첨삭 결과를 확인하지 못했습니다. 상태를 새로고침해 주세요.',
        });
      }
      return detail;
    };

    const recover = createReviewJobRecovery({
      jobId,
      queryClient,
      controller,
      refreshDetail,
      onConnectionIssue: (message) => setConnectionIssue({ jobId, message }),
    });

    void connectLlmJobEvents(jobId, {
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      onmessage: ({ event, data }) => {
        const message = parseCoverLetterReviewEvent(event, data);
        if (!message) return;
        setConnectionIssue(undefined);
        if (message.event === 'job.state') {
          queryClient.setQueryData(jobQueryKey, message.data);
          hasReceivedTerminalState = isTerminalJobStatus(message.data.status);
        } else {
          setPartialQuestionResults((previous) => {
            const previousQuestions = previous?.jobId === jobId ? previous.items : [];
            return {
              jobId,
              items: mergeReviewQuestionSnapshots(previousQuestions, message.data.items),
            };
          });
        }
      },
      onRetry: async () => {
        await recover(false);
      },
    })
      .then(async () => {
        if (controller.signal.aborted) return;
        // 종료 상태 이후의 문항 결과도 받은 뒤 연결 종료 시 최종 결과를 재조회합니다.
        if (hasReceivedTerminalState) {
          try {
            await refreshDetail();
          } catch {
            if (!controller.signal.aborted)
              setConnectionIssue({
                jobId,
                message: '첨삭 결과를 불러오지 못했습니다. 상태를 새로고침해 주세요.',
              });
          }
        } else {
          await recover(true);
        }
      })
      .catch(() => {
        void recover(true);
      });

    return () => controller.abort();
  }, [coverLetterId, jobId, subscriptionAttempt, queryClient]);

  const retry = () => {
    setConnectionIssue(undefined);
    setSubscriptionAttempt((previous) => previous + 1);
  };

  return {
    jobState,
    questionResults:
      partialQuestionResults && partialQuestionResults.jobId === jobId
        ? partialQuestionResults.items
        : [],
    connectionIssue:
      connectionIssue && connectionIssue.jobId === jobId ? connectionIssue.message : undefined,
    retry,
  };
}
