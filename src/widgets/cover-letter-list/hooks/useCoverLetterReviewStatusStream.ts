'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  connectCoverLetterReviewStatuses,
  matchesCoverLetterReviewStatusSnapshot,
  coverLetterQueryKeys,
} from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';
import { refreshAuthTokens } from '@/entities/user';
import { withStreamRecoveryTimeout } from '@/shared/api/stream/withStreamRecoveryTimeout';

import { isRetryableRefreshError } from '../utils/isRetryableRefreshError';
import { waitForRefreshRetry } from '../utils/waitForRefreshRetry';

const MAX_RETRY_DELAY_MS = 120_000;

/**
 * ## useCoverLetterReviewStatusStream
 *
 * @description
 * 목록 화면에서 사용자 단위 첨삭 상태 스트림을 하나 구독합니다.
 * 스냅샷이 캐시와 다르거나 변경 이벤트를 받으면 표시 중인 페이지를 재조회하고,
 * 다른 페이지는 다음 진입 시 최신 상태로 조회합니다.
 * 연결 오류·무응답 시에도 목록을 복구 조회하고, 조회가 끝난 뒤 SSE를 재연결합니다.
 * 갱신의 네트워크 오류·5xx는 3초 뒤 한 번 재시도하며, 최종 결과까지 오류 안내를 보류합니다.
 * 페이지 이동 시 연결을 유지하며 화면을 떠날 때 구독을 종료합니다.
 */
export const useCoverLetterReviewStatusStream = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRefreshTimedOut, setHasRefreshTimedOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let refreshTask: Promise<void> | undefined;
    let refreshRequested = false;

    const refreshOnce = async () => {
      const filters = { queryKey: coverLetterQueryKeys.lists() };
      // 이벤트 이전에 시작한 응답이 최신 상태를 덮어쓰지 않도록 먼저 취소합니다.
      await queryClient.cancelQueries(filters);
      if (controller.signal.aborted) return;

      await withStreamRecoveryTimeout(controller.signal, async (signal) => {
        const handleAbort = () => {
          void queryClient.cancelQueries(filters);
        };
        signal.addEventListener('abort', handleAbort, { once: true });
        try {
          await queryClient.invalidateQueries(filters, { throwOnError: true });
        } finally {
          signal.removeEventListener('abort', handleAbort);
        }
      });
    };

    const refreshLists = () => {
      if (controller.signal.aborted) {
        return;
      }

      refreshRequested = true;
      if (refreshTask) {
        // 재연결 호출부도 진행 중인 목록 복구가 끝날 때까지 같은 Promise를 기다립니다.
        return refreshTask;
      }

      setHasRefreshTimedOut(false);
      setIsRefreshing(true);
      refreshTask = (async () => {
        do {
          refreshRequested = false;
          try {
            await refreshOnce();
          } catch (error) {
            if (controller.signal.aborted) {
              return;
            }
            if (!isRetryableRefreshError(error)) {
              setHasRefreshTimedOut(error instanceof DOMException && error.name === 'TimeoutError');
              refreshRequested = false;
              break;
            }
            if (!(await waitForRefreshRetry(controller.signal))) {
              return;
            }

            // 대기 중 수신한 이벤트는 이 재시도에 합칩니다.
            refreshRequested = false;
            try {
              await refreshOnce();
            } catch (error) {
              if (!controller.signal.aborted) {
                setHasRefreshTimedOut(
                  error instanceof DOMException && error.name === 'TimeoutError'
                );
              }
              // 최종 실패 시 이번 갱신을 끝내고 다음 이벤트나 사용자 동작을 기다립니다.
              refreshRequested = false;
              break;
            }
          }
        } while (refreshRequested && !controller.signal.aborted);
      })().finally(() => {
        refreshTask = undefined;
        if (refreshRequested && !controller.signal.aborted) {
          refreshLists();
        } else if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      });
      return refreshTask;
    };

    void connectCoverLetterReviewStatuses({
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      reconnectOnClose: true,
      maxRetryDelayMs: MAX_RETRY_DELAY_MS,
      onmessage: ({ event, data }) => {
        if (
          event === 'cover-letter.review-status.snapshot' ||
          event === 'cover-letter.review-status.changed'
        ) {
          if (event === 'cover-letter.review-status.snapshot') {
            const lists = queryClient
              .getQueriesData<CoverLetterListResponse>({ queryKey: coverLetterQueryKeys.lists() })
              .map(([, list]) => list)
              .filter((list) => list !== undefined);

            // 프리패칭 결과와 상태가 같으면 스냅샷으로 인한 중복 조회를 생략합니다.
            if (matchesCoverLetterReviewStatusSnapshot(data, lists)) {
              return;
            }
          }

          refreshLists();
        }
      },
      onRetry: async () => {
        await refreshLists();
      },
    }).catch(refreshLists);

    return () => controller.abort();
  }, [queryClient]);

  return { isRefreshing, hasRefreshTimedOut };
};
