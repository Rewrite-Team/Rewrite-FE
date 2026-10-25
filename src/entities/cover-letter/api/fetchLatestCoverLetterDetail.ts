import { coverLetterDetailQueryOptions } from './queries';
import { coverLetterQueryKeys } from './queryKeys';

import type { QueryClient } from '@tanstack/react-query';

/** 진행 중인 상세 조회를 취소하고 캐시 신선도와 관계없이 최신 데이터를 조회합니다. */
export async function fetchLatestCoverLetterDetail(
  queryClient: QueryClient,
  coverLetterId: string,
  signal?: AbortSignal
) {
  await queryClient.cancelQueries({
    queryKey: coverLetterQueryKeys.detail(coverLetterId),
    exact: true,
  });
  // SSE 구독이 종료되었다면 취소 대기 이후 새 조회를 시작하지 않습니다.
  signal?.throwIfAborted();
  return queryClient.fetchQuery({
    ...coverLetterDetailQueryOptions(coverLetterId),
    staleTime: 0,
  });
}
