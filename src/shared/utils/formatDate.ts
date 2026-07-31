/**
 * ## formatDate
 *
 * @description
 * 백엔드에서 전달한 ISO 8601 날짜·시간 문자열을 화면 표시용 `YYYY.MM.DD` 형식으로 변환합니다.
 *
 * @param date - 날짜와 시간이 포함된 ISO 8601 문자열
 * @returns 점으로 구분한 날짜 문자열
 *
 * @example
 * ```ts
 * formatDate('2026-06-20T14:00:00');
 * // '2026.06.20'
 * ```
 */
export const formatDate = (date: string) => date.slice(0, 10).replaceAll('-', '.');
