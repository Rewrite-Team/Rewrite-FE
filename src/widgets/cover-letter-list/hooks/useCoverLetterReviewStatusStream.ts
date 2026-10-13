'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  connectCoverLetterReviewStatuses,
  CoverLetterListItemResponseDisplayStatus,
  coverLetterQueryKeys,
} from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';
import { refreshAuthTokens } from '@/entities/user';

const FALLBACK_RETRY_COUNT = 3;
const reviewStatusSnapshotSchema = z.object({
  items: z.array(
    z.object({
      coverLetterId: z.string(),
      displayStatus: z.enum(CoverLetterListItemResponseDisplayStatus),
      latestReviewedVersionId: z.string().nullable(),
    })
  ),
});

const matchesCachedLists = (data: string, lists: CoverLetterListResponse[]) => {
  try {
    const snapshot = reviewStatusSnapshotSchema.safeParse(JSON.parse(data));

    if (!snapshot.success || lists.length === 0) {
      return false;
    }

    const statuses = new Map(snapshot.data.items.map((item) => [item.coverLetterId, item]));
    return lists.every(
      (list) =>
        list.totalItems === statuses.size &&
        list.items.every((item) => {
          const status = statuses.get(item.id);
          return (
            status?.displayStatus === item.displayStatus &&
            status.latestReviewedVersionId === item.latestReviewedVersionId
          );
        })
    );
  } catch {
    return false;
  }
};

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

    const refreshLists = () => {
      if (!controller.signal.aborted) {
        void queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
      }
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
            if (matchesCachedLists(data, lists)) {
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
