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

/** 메모리에 보관한 CSRF 토큰을 반환하고, 없으면 동시 요청을 합쳐 발급받습니다. */
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

/**
 * ## httpClient
 *
 * @description
 * Orval 생성 API가 사용하는 브라우저 전용 HTTP mutator입니다. API 기본 주소를 적용하고 쿠키를 포함합니다.
 * POST, PUT, PATCH, DELETE 요청에는 메모리에 보관한 CSRF 토큰을 추가하며,
 * `CSRF_TOKEN_INVALID` 오류가 발생한 경우 토큰을 다시 발급받아 원 요청을 한 번 재시도합니다.
 *
 * 서버 컴포넌트나 서버 함수에서는 사용하지 말고 `serverHttpClient`를 사용합니다.
 *
 * @param url - API 경로 또는 절대 URL입니다.
 * @param options - HTTP 메서드, 본문, 헤더 등 fetch 요청 옵션입니다.
 * @returns 응답 본문을 Orval이 지정한 타입으로 반환합니다.
 * @throws {ApiError} HTTP 오류 응답이 발생하고, CSRF 토큰 오류는 재발급 후 재시도도 실패하면 전달됩니다.
 * @throws 환경변수가 없거나 네트워크·응답 파싱 오류가 발생할 때 오류를 전달합니다.
 *
 * @example
 * ```ts
 * const user = await httpClient<{ id: string }>('/user/me', { method: 'GET' });
 * ```
 */
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
