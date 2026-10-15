/**
 * 브라우저에서 사용하는 공개 API 기본 주소를 반환합니다.
 *
 * @returns `NEXT_PUBLIC_API_BASE_URL` 환경변수 값입니다.
 * @throws 환경변수가 설정되지 않았으면 오류를 발생시킵니다.
 */
export function getClientApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  return apiBaseUrl;
}
