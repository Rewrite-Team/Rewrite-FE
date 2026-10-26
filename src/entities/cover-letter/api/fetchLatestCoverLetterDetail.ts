import { coverLetterDetailQueryOptions } from './queries';
import { coverLetterQueryKeys } from './queryKeys';

import type { QueryClient } from '@tanstack/react-query';

/** 진행 중인 상세 조회를 취소하고 캐시 신선도와 관계없이 최신 데이터를 조회합니다. */
export async function fetchLatestCoverLetterDetail(
  queryClient: QueryClient,
  coverLetterId: string,
  signal?: AbortSignal
) {
  const filters = {
    queryKey: coverLetterQueryKeys.detail(coverLetterId),
    exact: true,
  };
  await queryClient.cancelQueries(filters);
  // SSE 구독이 종료되었다면 취소 대기 이후 새 조회를 시작하지 않습니다.
  signal?.throwIfAborted();
  // 외부 취소는 쿼리의 signal에도 전달해 실제 진행 중인 HTTP 요청을 종료합니다.
  const handleAbort = () => {
    void queryClient.cancelQueries(filters);
  };
  signal?.addEventListener('abort', handleAbort, { once: true });
  try {
    const detail = await queryClient.fetchQuery({
      ...coverLetterDetailQueryOptions(coverLetterId),
      staleTime: 0,
    });
    signal?.throwIfAborted();
    return detail;
  } finally {
    signal?.removeEventListener('abort', handleAbort);
  }
}
