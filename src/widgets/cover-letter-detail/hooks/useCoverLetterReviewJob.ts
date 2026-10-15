'use client';

import { useEffect, useState } from 'react';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions, coverLetterQueryKeys } from '@/entities/cover-letter';
import {
  connectLlmJobEvents,
  getLlmJobStatus,
  parseCoverLetterReviewEvent,
  llmJobQueryKeys,
  type LlmJobStateResponse,
  type ReviewQuestionSnapshot,
} from '@/entities/llm-job';
import { reviewVersionQueryKeys } from '@/entities/review-version';
import { refreshAuthTokens } from '@/entities/user';

const RECOVERY_RETRY_COUNT = 3;
const isTerminal = (status: LlmJobStateResponse['status']) =>
  status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED';

/** 첨삭 Job을 구독하고 스트림 종료·장애 시 HTTP 조회로 최종 상태를 복구합니다. */
export function useCoverLetterReviewJob(coverLetterId: string, jobId?: string) {
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState(0);
  const [issue, setIssue] = useState<{ jobId: string; message: string }>();
  const [partial, setPartial] = useState<{ jobId: string; items: ReviewQuestionSnapshot[] }>();
  const queryKey = llmJobQueryKeys.status(jobId ?? '');
  const { data: job } = useQuery<LlmJobStateResponse>({
    queryKey,
    queryFn: skipToken,
  });

  useEffect(() => {
    if (!jobId) return;
    const controller = new AbortController();
    const key = llmJobQueryKeys.status(jobId);
    let retryCount = 0;
    let terminalReceived = false;
    let recovery: Promise<void> | undefined;

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
        setIssue({
          jobId,
          message: '최신 첨삭 결과를 확인하지 못했습니다. 상태를 새로고침해 주세요.',
        });
      }
      return detail;
    };

    const recover = (closed: boolean) => {
      if (controller.signal.aborted || recovery) return recovery;
      recovery = (async () => {
        try {
          const state = await getLlmJobStatus(jobId, { signal: controller.signal });
          if (controller.signal.aborted) return;
          queryClient.setQueryData(key, state);
          if (isTerminal(state.status)) {
            await refreshDetail();
            controller.abort();
          } else if (closed) {
            setIssue({
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
            setIssue({
              jobId,
              message: '진행 상태를 불러오지 못했습니다. 상태를 새로고침해 주세요.',
            });
        }
      })().finally(() => {
        recovery = undefined;
      });
      return recovery;
    };

    void connectLlmJobEvents(jobId, {
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      onmessage: ({ event, data }) => {
        const message = parseCoverLetterReviewEvent(event, data);
        if (!message) return;
        retryCount = 0;
        setIssue(undefined);
        if (message.event === 'job.state') {
          queryClient.setQueryData(key, message.data);
          terminalReceived = isTerminal(message.data.status);
        } else {
          setPartial((previous) => {
            const items = new Map(
              (previous?.jobId === jobId ? previous.items : []).map((item) => [
                item.questionId,
                item,
              ])
            );
            for (const item of message.data.items)
              items.set(item.questionId, { ...items.get(item.questionId), ...item });
            return { jobId, items: [...items.values()].sort((a, b) => a.order - b.order) };
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
        if (terminalReceived) {
          try {
            await refreshDetail();
          } catch {
            if (!controller.signal.aborted)
              setIssue({
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
  }, [coverLetterId, jobId, attempt, queryClient]);

  const retry = () => {
    setIssue(undefined);
    setAttempt((previous) => previous + 1);
  };

  return {
    job,
    items: partial && partial.jobId === jobId ? partial.items : [],
    issue: issue && issue.jobId === jobId ? issue.message : undefined,
    retry,
  };
}
