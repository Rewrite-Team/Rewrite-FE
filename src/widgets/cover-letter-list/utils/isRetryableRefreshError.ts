import { ApiError } from '@/shared/api';

/** 목록 갱신은 네트워크 오류·5xx에만 제한적으로 재시도합니다. */
export const isRetryableRefreshError = (error: unknown) =>
  error instanceof ApiError
    ? error.status >= 500 && error.status < 600
    : error instanceof TypeError;
