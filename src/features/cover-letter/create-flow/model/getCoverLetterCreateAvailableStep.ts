import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import {
  getCoverLetterStep1DefaultValues,
  getCoverLetterStep2DefaultValues,
  getCoverLetterStep3DefaultValues,
} from './getCoverLetterStepDefaultValues';
import {
  coverLetterStep1Schema,
  coverLetterStep2Schema,
  coverLetterStep3Schema,
} from './schemas/coverLetterCreateSchemas';

import type { WritingCreateStep } from './writingCreateStep';

/** 서버에 저장된 입력값을 기준으로 처음 작성해야 하는 단계까지 진입을 허용합니다. */
export function getCoverLetterCreateAvailableStep(
  draft: CoverLetterDetailResponse
): WritingCreateStep {
  if (!coverLetterStep1Schema.safeParse(getCoverLetterStep1DefaultValues(draft)).success) return 1;
  if (!coverLetterStep2Schema.safeParse(getCoverLetterStep2DefaultValues(draft)).success) return 2;
  if (!coverLetterStep3Schema.safeParse(getCoverLetterStep3DefaultValues(draft)).success) return 3;

  return 4;
}
