import { ApiError } from './ApiError';

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

/** 공통 URL 구성, fetch 실행, 응답 파싱 및 API 오류 변환을 담당합니다. */
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
