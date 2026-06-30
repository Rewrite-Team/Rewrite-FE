/**
 * 앱 전반에서 재사용하는 입력 길이 제한입니다.
 *
 * 도메인별 정책 변경 시 숫자 리터럴을 직접 수정하지 않고 이 상수를 통해 추적합니다.
 */
export const INPUT_LIMITS = {
  AI_REVIEW_REQUIREMENT: 1000,
} as const;
