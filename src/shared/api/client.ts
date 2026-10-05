'use client';

import { ApiError } from './apiError';
import { getClientApiBaseUrl } from './config';
import { request } from './core';

interface CsrfTokenResponse {
  csrfToken: string;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_TOKEN_URL = '/auth/csrf-token';
const REFRESH_AUTH_URL = '/auth/refresh';
const LOGOUT_URL = '/auth/logout';
export const AUTH_SESSION_EXPIRED_EVENT = 'rewrite:auth-session-expired';

// CSRF 토큰은 명세에 따라 브라우저 메모리에만 보관합니다.
let csrfToken: string | undefined;
// 동시에 시작된 요청은 하나의 토큰 발급 요청을 공유합니다.
let csrfTokenRequest: Promise<string> | undefined;
// 동시 401은 하나의 refresh 요청을 기다리고, 로그아웃은 해당 refresh가 끝난 뒤 실행합니다.
let authRefreshRequest: Promise<unknown> | undefined;
let logoutRequest: Promise<unknown> | undefined;
let hasNotifiedAuthSessionExpired = false;

/** 메모리에 보관한 CSRF 토큰을 반환하고, 없으면 동시 요청을 합쳐 발급받습니다. */
const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = request<CsrfTokenResponse>(
      CSRF_TOKEN_URL,
      { method: 'GET', credentials: 'include' },
      getClientApiBaseUrl()
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

const isEndpoint = (url: string, endpoint: string, baseUrl: string) =>
  new URL(url, baseUrl).pathname === endpoint;

const requestWithCsrf = async <T>(
  url: string,
  options: RequestInit,
  baseUrl: string
): Promise<T> => {
  const method = (options.method ?? 'GET').toUpperCase();

  if (!MUTATING_METHODS.has(method)) {
    return request<T>(url, { ...options, credentials: 'include' }, baseUrl);
  }

  const headers = new Headers(options.headers);
  const requestCsrfToken = await getCsrfToken();
  headers.set('X-CSRF-Token', requestCsrfToken);

  try {
    return await request<T>(url, { ...options, headers, credentials: 'include' }, baseUrl);
  } catch (error) {
    if (!isCsrfError(error)) {
      throw error;
    }

    headers.set('X-CSRF-Token', await getFreshCsrfToken(requestCsrfToken));
    return request<T>(url, { ...options, headers, credentials: 'include' }, baseUrl);
  }
};

const getSharedAuthRefresh = (baseUrl: string): Promise<unknown> => {
  if (logoutRequest) {
    return Promise.reject(new ApiError(401));
  }

  if (!authRefreshRequest) {
    authRefreshRequest = requestWithCsrf(REFRESH_AUTH_URL, { method: 'POST' }, baseUrl)
      .then((result) => {
        hasNotifiedAuthSessionExpired = false;
        return result;
      })
      .finally(() => {
        authRefreshRequest = undefined;
      });
  }

  return authRefreshRequest;
};

const notifyAuthSessionExpired = () => {
  if (hasNotifiedAuthSessionExpired) {
    return;
  }

  hasNotifiedAuthSessionExpired = true;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
};

const requestWithAuthRefresh = async <T>(
  url: string,
  options: RequestInit,
  baseUrl: string
): Promise<T> => {
  try {
    return await requestWithCsrf<T>(url, options, baseUrl);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || logoutRequest) {
      throw error;
    }

    try {
      await getSharedAuthRefresh(baseUrl);
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        notifyAuthSessionExpired();
      }

      throw refreshError;
    }

    try {
      return await requestWithCsrf<T>(url, options, baseUrl);
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        notifyAuthSessionExpired();
      }

      throw retryError;
    }
  }
};

const requestLogout = <T>(url: string, options: RequestInit, baseUrl: string): Promise<T> => {
  if (logoutRequest) {
    return logoutRequest as Promise<T>;
  }

  logoutRequest = (async () => {
    // refresh 도중 logout이 시작되어도 토큰 회전과 쿠키 만료 요청이 겹치지 않습니다.
    await authRefreshRequest?.catch(() => undefined);
    return requestWithCsrf<T>(url, options, baseUrl);
  })().finally(() => {
    logoutRequest = undefined;
  });

  return logoutRequest as Promise<T>;
};

/**
 * ## httpClient
 *
 * @description
 * Orval 생성 API가 사용하는 브라우저 전용 HTTP mutator입니다. API 기본 주소를 적용하고 쿠키를 포함합니다.
 * 모든 요청에 쿠키를 포함합니다. 상태 변경 요청은 메모리에 보관한 CSRF 토큰을 추가하고,
 * 보호 API의 401은 refresh single-flight 뒤 원 요청을 한 번 재시도합니다.
 * 로그아웃과 refresh는 직렬화하며, refresh 자체의 401은 반복 갱신하지 않습니다.
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
  const baseUrl = getClientApiBaseUrl();

  if (isEndpoint(url, REFRESH_AUTH_URL, baseUrl)) {
    return getSharedAuthRefresh(baseUrl) as Promise<T>;
  }

  if (isEndpoint(url, LOGOUT_URL, baseUrl)) {
    return requestLogout<T>(url, { ...options, method }, baseUrl);
  }

  return requestWithAuthRefresh<T>(url, { ...options, method }, baseUrl);
}
