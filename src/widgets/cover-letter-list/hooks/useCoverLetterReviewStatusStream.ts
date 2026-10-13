'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  connectCoverLetterReviewStatuses,
  matchesCoverLetterReviewStatusSnapshot,
  coverLetterQueryKeys,
} from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';
import { refreshAuthTokens } from '@/entities/user';

const FALLBACK_RETRY_COUNT = 3;
/**
 * ## useCoverLetterReviewStatusStream
 *
 * @description
 * 목록 화면에서 사용자 단위 첨삭 상태 스트림을 하나 구독합니다.
 * 스냅샷이 캐시와 다르거나 변경 이벤트를 받으면 표시 중인 페이지를 재조회하고,
 * 다른 페이지는 다음 진입 시 최신 상태로 조회합니다.
 * 페이지 이동 시 연결을 유지하며 화면을 떠날 때 구독을 종료합니다.
 */
export const useCoverLetterReviewStatusStream = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    let retryCount = 0;
    let refreshTask: Promise<void> | undefined;
    let refreshRequested = false;

    const refreshLists = () => {
      if (controller.signal.aborted) {
        return;
      }

      refreshRequested = true;
      if (refreshTask) {
        return;
      }

      refreshTask = (async () => {
        do {
          refreshRequested = false;
          // 이벤트 이전에 시작한 응답이 최신 상태를 덮어쓰지 않도록 먼저 취소합니다.
          await queryClient.cancelQueries({ queryKey: coverLetterQueryKeys.lists() });
          if (controller.signal.aborted) {
            return;
          }
          await queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
        } while (refreshRequested && !controller.signal.aborted);
      })().finally(() => {
        refreshTask = undefined;
        if (refreshRequested && !controller.signal.aborted) {
          refreshLists();
        }
      });
    };

    void connectCoverLetterReviewStatuses({
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      reconnectOnClose: true,
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
};
