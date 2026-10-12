'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { connectCoverLetterReviewStatuses, coverLetterQueryKeys } from '@/entities/cover-letter';
import { refreshAuthTokens } from '@/entities/user';

const FALLBACK_RETRY_COUNT = 3;

/**
 * ## useCoverLetterReviewStatusStream
 *
 * @description
 * 목록 화면에서 사용자 단위 첨삭 상태 스트림을 하나 구독합니다.
 * 스냅샷·변경 이벤트를 받으면 목록 캐시를 무효화해 표시 중인 페이지를 재조회하고,
 * 다른 페이지는 다음 진입 시 최신 상태로 조회합니다.
 * 페이지 이동 시 연결을 유지하며 화면을 떠날 때 구독을 종료합니다.
 */
export const useCoverLetterReviewStatusStream = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    let retryCount = 0;

    const refreshLists = () => {
      if (!controller.signal.aborted) {
        void queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
      }
    };

    void connectCoverLetterReviewStatuses({
      signal: controller.signal,
      refreshAuth: refreshAuthTokens,
      reconnectOnClose: true,
      onmessage: ({ event }) => {
        if (
          event === 'cover-letter.review-status.snapshot' ||
          event === 'cover-letter.review-status.changed'
        ) {
          retryCount = 0;
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
