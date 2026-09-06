import type { WritingCreateStep } from '@/shared/types/writingCreate';

/** 자기소개서 등록 라우트에서 허용하는 STEP 세그먼트입니다. */
export type CoverLetterCreateStepSegment = `step${WritingCreateStep}`;
