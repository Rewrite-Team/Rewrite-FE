import { queryOptions } from '@tanstack/react-query';

import { getCurrentUser } from './api';
import { userQueryKeys } from './queryKeys';

export const currentUserQueryOptions = queryOptions({
  queryKey: userQueryKeys.current,
  queryFn: () => getCurrentUser(),
  retry: false,
});
