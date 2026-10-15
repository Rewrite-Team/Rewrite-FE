'use client';

import { useEffect, useState } from 'react';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions, coverLetterQueryKeys } from '@/entities/cover-letter';
import {
  connectLlmJobEvents,
  getLlmJobStatus,
  parseCoverLetterReviewEvent,
  mergeReviewQuestionSnapshots,
  llmJobQueryKeys,
  type LlmJobStateResponse,
  type ReviewQuestionSnapshot,
} from '@/entities/llm-job';
import { reviewVersionQueryKeys } from '@/entities/review-version';
import { refreshAuthTokens } from '@/entities/user';

const RECOVERY_RETRY_COUNT = 3;
const isTerminalJobStatus = (status: LlmJobStateResponse['status']) =>
  status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED';

/** 첨삭 Job을 구독하고 스트림 종료·장애 시 HTTP 조회로 최종 상태를 복구합니다. */
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
    queryFn: skipToken,
  });

  useEffect(() => {
    if (!jobId) return;
    const controller = new AbortController();
    const jobQueryKey = llmJobQueryKeys.status(jobId);
    let retryCount = 0;
    let hasReceivedTerminalState = false;
    let recoveryPromise: Promise<void> | undefined;

    const refreshDetail = async () => {
      await queryClient.cancelQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
      if (controller.signal.aborted) return;
      const detail = await queryClient.fetchQuery(coverLetterDetailQueryOptions(coverLetterId));
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

    const recover = (isStreamClosed: boolean) => {
      if (controller.signal.aborted || recoveryPromise) return recoveryPromise;
      recoveryPromise = (async () => {
        try {
          const state = await getLlmJobStatus(jobId, { signal: controller.signal });
          if (controller.signal.aborted) return;
          queryClient.setQueryData(jobQueryKey, state);
          if (isTerminalJobStatus(state.status)) {
            await refreshDetail();
            controller.abort();
          } else if (isStreamClosed) {
            setConnectionIssue({
              jobId,
              message: '진행 상태 연결이 종료되었습니다. 상태를 새로고침해 주세요.',
            });
          }
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
            setConnectionIssue({
              jobId,
              message: '진행 상태를 불러오지 못했습니다. 상태를 새로고침해 주세요.',
            });
        }
      })().finally(() => {
        recoveryPromise = undefined;
      });
      return recoveryPromise;
    };

    void connectLlmJobEvents(jobId, {
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      onmessage: ({ event, data }) => {
        const message = parseCoverLetterReviewEvent(event, data);
        if (!message) return;
        retryCount = 0;
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
      onRetry: () => {
        retryCount += 1;
        if (retryCount % RECOVERY_RETRY_COUNT === 0) void recover(false);
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
