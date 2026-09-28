import { ApiError } from './ApiError';

const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  return apiBaseUrl;
};

const resolveUrl = (url: string) => {
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return new URL(url, getApiBaseUrl()).toString();
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

/**
 * Orval 생성 함수가 공통으로 사용하는 Fetch 어댑터입니다.
 * 인증, Cookie 전달, CSRF 및 토큰 갱신 정책은 인증 연동 시 이 경계에 추가합니다.
 */
export async function httpClient<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(resolveUrl(url), options);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
