import { queryOptions } from '@tanstack/react-query';

import { listCoverLetters } from './api';
import { getCoverLetterListParams } from './listParams';
import { coverLetterQueryKeys } from './queryKeys';

export const coverLetterListQueryOptions = (requestedPage?: number) => {
  const params = getCoverLetterListParams(requestedPage);

  return queryOptions({
    queryKey: coverLetterQueryKeys.list(params),
    queryFn: ({ signal }) => listCoverLetters(params, { signal }),
    // 인증 갱신은 공통 클라이언트가 처리하고, 조회 실패는 화면에서 수동 재시도합니다.
    retry: false,
  });
};
