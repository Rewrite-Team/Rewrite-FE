import { WRITING_CREATE_STEPS } from '@/shared/constants/writingCreate';
import type { WritingCreateStep } from '@/shared/types/writingCreate';

const getWritingCreateStepRoute = (step: WritingCreateStep) => `/writing/create/step${step}`;

/**
 * 앱 전반에서 사용하는 라우트 경로 상수입니다.
 * 경로 문자열 변경 시 호출부를 함께 추적할 수 있도록 이 상수를 통해 참조합니다.
 */
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  WRITING: '/writing',
  WRITING_CREATE: getWritingCreateStepRoute(WRITING_CREATE_STEPS[0]),
  WRITING_CREATE_STEP: getWritingCreateStepRoute,
  WRITING_DETAIL: (writingId: string) => `/writing/${writingId}`,
  INTERVIEW: (writingId: string) => `/writing/${writingId}/interview`,
  KEYWORD_ANALYSIS: (writingId: string) => `/writing/${writingId}/keyword-analysis`,
} as const;
