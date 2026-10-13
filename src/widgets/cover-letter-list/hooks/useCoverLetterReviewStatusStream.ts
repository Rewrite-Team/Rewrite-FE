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
import { ApiError } from '@/shared/api/apiError';

const FALLBACK_RETRY_COUNT = 3;
const MAX_RETRY_DELAY_MS = 120_000;
const REFRESH_RETRY_DELAY_MS = 3000;

const isRetryableRefreshError = (error: unknown) =>
  error instanceof ApiError
    ? error.status >= 500 && error.status < 600
    : error instanceof TypeError;

/** 화면 이탈 시 타이머와 리스너를 정리하고 재시도 대기를 종료합니다. */
const waitForRefreshRetry = (signal: AbortSignal) =>
  new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', handleAbort);
      resolve(false);
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve(true);
    }, REFRESH_RETRY_DELAY_MS);
    signal.addEventListener('abort', handleAbort, { once: true });
  });

/**
 * ## useCoverLetterReviewStatusStream
 *
 * @description
 * 목록 화면에서 사용자 단위 첨삭 상태 스트림을 하나 구독합니다.
 * 스냅샷이 캐시와 다르거나 변경 이벤트를 받으면 표시 중인 페이지를 재조회하고,
 * 다른 페이지는 다음 진입 시 최신 상태로 조회합니다.
 * 갱신의 네트워크 오류·5xx는 3초 뒤 한 번 재시도하며, 최종 결과까지 오류 안내를 보류합니다.
 * 페이지 이동 시 연결을 유지하며 화면을 떠날 때 구독을 종료합니다.
 */
export const useCoverLetterReviewStatusStream = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let retryCount = 0;
    let refreshTask: Promise<void> | undefined;
    let refreshRequested = false;

    const refreshOnce = async () => {
      // 이벤트 이전에 시작한 응답이 최신 상태를 덮어쓰지 않도록 먼저 취소합니다.
      await queryClient.cancelQueries({ queryKey: coverLetterQueryKeys.lists() });
      if (!controller.signal.aborted) {
        await queryClient.invalidateQueries(
          { queryKey: coverLetterQueryKeys.lists() },
          { throwOnError: true }
        );
      }
    };

    const refreshLists = () => {
      if (controller.signal.aborted) {
        return;
      }

      refreshRequested = true;
      if (refreshTask) {
        return;
      }

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
            } catch {
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
          retryCount = 0;

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
      onRetry: () => {
        retryCount += 1;

        if (retryCount === FALLBACK_RETRY_COUNT) {
          refreshLists();
        }
      },
    }).catch(refreshLists);

    return () => controller.abort();
  }, [queryClient]);

  return { isRefreshing };
};
