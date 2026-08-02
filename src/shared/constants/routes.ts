/**
 * 앱 전반에서 사용하는 라우트 경로 상수입니다.
 *
 * 경로 문자열 변경 시 호출부를 함께 추적할 수 있도록 문자열을 직접 작성하지 않고
 * 이 상수를 통해 참조합니다.
 */
export type WritingCreateStep = 1 | 2 | 3 | 4;

const getWritingCreateStepRoute = (step: WritingCreateStep) => `/writing/create/step${step}`;

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  WRITING: '/writing',
  WRITING_CREATE: getWritingCreateStepRoute(1),
  WRITING_CREATE_STEP: getWritingCreateStepRoute,
  WRITING_DETAIL: (writingId: string) => `/writing/${writingId}`,
  INTERVIEW: (writingId: string) => `/writing/${writingId}/interview`,
  KEYWORD_ANALYSIS: (writingId: string) => `/writing/${writingId}/keyword-analysis`,
} as const;
