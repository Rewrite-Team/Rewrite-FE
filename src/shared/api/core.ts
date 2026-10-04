import { ApiError } from './apiError';

const isJsonContentType = (contentType: string | null) => {
  const mediaType = contentType?.split(';', 1)[0]?.trim().toLowerCase();

  return mediaType === 'application/json' || mediaType?.endsWith('+json') === true;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get('content-type');

  if (isJsonContentType(contentType)) {
    return response.json();
  }

  return response.text();
};

/**
 * ## request
 *
 * @description
 * 환경별 어댑터가 공통으로 사용하는 HTTP 요청 함수입니다. API 기본 주소를 기준으로 URL을 구성하고,
 * 응답 본문을 Content-Type에 따라 JSON 또는 텍스트로 파싱합니다. HTTP 오류 응답은 `ApiError`로 변환합니다.
 *
 * 브라우저 쿠키나 서버 요청 쿠키는 이 함수에서 설정하지 않고 호출하는 어댑터가 전달해야 합니다.
 *
 * @param url - API 경로 또는 절대 URL입니다.
 * @param options - fetch에 전달할 요청 옵션입니다.
 * @param baseUrl - 상대 경로를 해석할 API 기본 주소입니다.
 * @returns 응답 본문을 지정한 타입으로 반환합니다. 204 또는 205 응답은 `undefined`를 반환합니다.
 * @throws {ApiError} 응답 상태가 성공이 아닐 때 발생합니다.
 * @throws 네트워크 오류 또는 성공 응답 본문을 파싱할 수 없을 때 원래 오류를 전달합니다.
 *
 * @example
 * ```ts
 * const result = await request<{ success: boolean }>(
 *   '/health',
 *   { method: 'GET' },
 *   'https://api.example.com'
 * );
 * ```
 */
export async function request<T>(url: string, options: RequestInit, baseUrl: string): Promise<T> {
  const response = await fetch(new URL(url, baseUrl).toString(), options);
  let data: unknown;

  try {
    data = await parseResponseBody(response);
  } catch (error) {
    if (!response.ok) {
      throw new ApiError(response.status);
    }

    throw error;
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
