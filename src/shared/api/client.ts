'use client';

import { ApiError } from './apiError';
import { request } from './core';

interface CsrfTokenResponse {
  csrfToken: string;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_TOKEN_URL = '/auth/csrf-token';

// CSRF 토큰은 명세에 따라 브라우저 메모리에만 보관합니다.
let csrfToken: string | undefined;
// 동시에 시작된 요청은 하나의 토큰 발급 요청을 공유합니다.
let csrfTokenRequest: Promise<string> | undefined;

const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  return apiBaseUrl;
};

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = request<CsrfTokenResponse>(
      CSRF_TOKEN_URL,
      { method: 'GET', credentials: 'include' },
      getApiBaseUrl()
    )
      .then(({ csrfToken: nextCsrfToken }) => {
        csrfToken = nextCsrfToken;
        return nextCsrfToken;
      })
      .finally(() => {
        csrfTokenRequest = undefined;
      });
  }

  return csrfTokenRequest;
};

/** 거절된 토큰이 여전히 최신일 때만 새 토큰을 발급합니다. */
const getFreshCsrfToken = async (rejectedToken: string) => {
  // 다른 요청이 먼저 토큰을 갱신했다면 그 토큰을 재사용합니다.
  if (csrfToken && csrfToken !== rejectedToken) {
    return csrfToken;
  }

  // 같은 만료 토큰으로 실패한 요청은 하나의 재발급 요청을 공유합니다.
  if (csrfTokenRequest) {
    return csrfTokenRequest;
  }

  csrfToken = undefined;

  return getCsrfToken();
};

const isCsrfError = (error: unknown): error is ApiError =>
  error instanceof ApiError && error.status === 403 && error.code === 'CSRF_TOKEN_INVALID';

/** 브라우저 요청에서 쿠키와 CSRF 토큰을 처리하는 Orval mutator입니다. */
export async function httpClient<T>(url: string, options: RequestInit): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 API 요청은 client 어댑터에서만 사용할 수 있습니다.');
  }

  const method = (options.method ?? 'GET').toUpperCase();
  const baseUrl = getApiBaseUrl();

  if (!MUTATING_METHODS.has(method)) {
    return request<T>(url, { ...options, credentials: 'include' }, baseUrl);
  }

  // 상태 변경 요청은 CSRF 토큰을 붙여 전송하고, 토큰 오류일 때만 한 번 재시도합니다.
  const headers = new Headers(options.headers);
  const requestCsrfToken = await getCsrfToken();
  headers.set('X-CSRF-Token', requestCsrfToken);

  try {
    return await request<T>(url, { ...options, headers, credentials: 'include' }, baseUrl);
  } catch (error) {
    if (!isCsrfError(error)) {
      throw error;
    }

    const freshCsrfToken = await getFreshCsrfToken(requestCsrfToken);
    headers.set('X-CSRF-Token', freshCsrfToken);

    return request<T>(url, { ...options, headers, credentials: 'include' }, baseUrl);
  }
}
