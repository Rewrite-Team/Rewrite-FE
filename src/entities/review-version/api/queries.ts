import { queryOptions } from '@tanstack/react-query';

import { getReviewVersionDetail, listReviewVersions } from './api';
import { reviewVersionQueryKeys } from './queryKeys';

const REVIEW_VERSION_DETAIL_STALE_TIME_MS = 30_000;

export const reviewVersionListQueryOptions = (coverLetterId: string) =>
  queryOptions({
    queryKey: reviewVersionQueryKeys.list(coverLetterId),
    queryFn: ({ signal }) => listReviewVersions(coverLetterId, { signal }),
    retry: false,
  });

export const reviewVersionDetailQueryOptions = (coverLetterId: string, versionId: string) =>
  queryOptions({
    queryKey: reviewVersionQueryKeys.detail(coverLetterId, versionId),
    queryFn: ({ signal }) => getReviewVersionDetail(coverLetterId, versionId, { signal }),
    // 버전 선택 전 조회한 결과를 화면 전환 직후 중복 요청하지 않습니다.
    staleTime: REVIEW_VERSION_DETAIL_STALE_TIME_MS,
    retry: false,
  });
