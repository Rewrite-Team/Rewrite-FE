'use client';

import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';

import { mapCoverLetterValidationErrors } from '../model/mapCoverLetterValidationErrors';
import { useCoverLetterCreateValidation } from '../ui/CoverLetterCreateDraftContext';

import type { WritingCreateStep } from '../model/writingCreateStep';

/**
 * ## useCoverLetterSaveError
 *
 * @description
 * STEP1~3 저장 mutation의 onError에서 서버 검증 오류를 해당 단계에 전달하고
 * 실패 토스트를 한 번 표시합니다. 입력란 오류와 포커스는 useCoverLetterStepErrors가 적용합니다.
 */
export function useCoverLetterSaveError(
  currentStep: Exclude<WritingCreateStep, 4>,
  errorMessage: string
) {
  const { setErrors } = useCoverLetterCreateValidation();

  return (error: unknown) => {
    const isValidationError = error instanceof ApiError && error.code === 'VALIDATION_ERROR';
    if (isValidationError) {
      const fieldErrors = mapCoverLetterValidationErrors(error.details).filter(
        (error) => error.step === currentStep
      );
      setErrors((errors) => [
        ...errors.filter((error) => error.step !== currentStep),
        ...fieldErrors,
      ]);
    }
    appToast.error(isValidationError ? '입력 내용을 확인하고 다시 저장해 주세요.' : errorMessage);
  };
}
