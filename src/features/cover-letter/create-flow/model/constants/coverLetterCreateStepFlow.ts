import type { WritingCreateStep } from '@/shared/constants/routes';

interface CoverLetterCreateStepFlow {
  nextStep: WritingCreateStep | null;
}

/** 자기소개서 등록 플로우의 마지막 STEP입니다. */
export const FINAL_COVER_LETTER_CREATE_STEP = 4 satisfies WritingCreateStep;

/**
 * 자기소개서 등록 STEP의 이동 순서를 정의합니다.
 * 마지막 STEP은 다음 경로가 없으므로 `nextStep`이 `null`입니다.
 */
export const COVER_LETTER_CREATE_STEP_FLOW = {
  1: { nextStep: 2 },
  2: { nextStep: 3 },
  3: { nextStep: 4 },
  4: { nextStep: null },
} as const satisfies Record<WritingCreateStep, CoverLetterCreateStepFlow>;
