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

/** 현재 요청의 인증 쿠키만 백엔드로 전달하는 서버 전용 요청 함수입니다. */
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
