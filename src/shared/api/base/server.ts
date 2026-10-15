import 'server-only';

import { cookies } from 'next/headers';

import { request } from './core';

const AUTH_COOKIE_NAMES = ['access_token', 'refresh_token'];

const getServerApiBaseUrl = () => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  return apiBaseUrl;
};

/**
 * ## serverHttpClient
 *
 * @description
 * 서버 컴포넌트, 서버 함수, Route Handler에서 사용하는 서버 전용 요청 함수입니다.
 * 현재 요청의 `access_token`과 `refresh_token` 쿠키만 백엔드로 전달하고 응답 캐시를 사용하지 않습니다.
 * API 주소는 클라이언트에 공개되지 않는 `API_BASE_URL` 환경변수에서 읽습니다.
 *
 * 클라이언트 컴포넌트에서 import하지 마세요. 이 모듈은 `server-only` 경계로 보호됩니다.
 *
 * @param url - API 경로 또는 절대 URL입니다.
 * @param options - fetch 요청 옵션입니다. 전달하지 않으면 기본 GET 요청을 사용합니다.
 * @returns 응답 본문을 지정한 타입으로 반환합니다. 204 또는 205 응답은 `undefined`를 반환합니다.
 * @throws {ApiError} 백엔드가 성공이 아닌 HTTP 상태를 반환할 때 발생합니다.
 * @throws 현재 요청 컨텍스트가 없거나 `API_BASE_URL`이 설정되지 않은 경우 오류를 전달합니다.
 *
 * @example
 * ```ts
 * const currentUser = await serverHttpClient<{ id: string }>('/user/me');
 * ```
 */
export async function serverHttpClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  // 요청마다 쿠키 저장소를 읽어 다른 사용자의 인증 정보가 섞이지 않게 합니다.
  const authCookies = cookieStore
    .getAll()
    .filter(({ name }) => AUTH_COOKIE_NAMES.includes(name))
    .map(({ name, value }) => `${name}=${value}`);
  const headers = new Headers(options.headers);

  if (authCookies.length > 0) {
    headers.set('Cookie', authCookies.join('; '));
  }

  return request<T>(
    url,
    {
      ...options,
      headers,
      cache: 'no-store',
    },
    getServerApiBaseUrl()
  );
}
