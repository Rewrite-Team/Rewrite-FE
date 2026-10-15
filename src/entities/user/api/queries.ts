import { queryOptions } from '@tanstack/react-query';

import { getCurrentUser } from './api';
import { userQueryKeys } from './queryKeys';

export const currentUserQueryOptions = queryOptions({
  queryKey: userQueryKeys.current,
  queryFn: () => getCurrentUser(),
  // 헤더와 인증 가드는 같은 사용자 캐시를 재사용하고, 로그아웃·세션 만료 시 제거합니다.
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
});
