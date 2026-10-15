'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';

import {
  mapCoverLetterValidationErrors,
  type CoverLetterValidationFieldError,
} from '../model/mapCoverLetterValidationErrors';
import { useCoverLetterCreateValidation } from '../ui/CoverLetterCreateDraftContext';

import type { WritingCreateStep } from '../model/writingCreateStep';

interface CoverLetterStepSaveOptions<Values> {
  coverLetterId: string;
  nextStep: WritingCreateStep;
  clearErrors: () => void;
  saveDraft: (values: Values) => Promise<unknown>;
  validateDraft?: (values: Values) => boolean;
  onValidationErrors: (errors: CoverLetterValidationFieldError[], values: Values) => void;
  errorMessage: string;
}

/**
 * ## useCoverLetterStepSave
 *
 * @description
 * STEP1~3의 중복 저장 방지, 서버 검증 오류 안내와 저장 후 이동을 처리합니다.
 * 반환 함수의 intent가 'draft'이면 저장 완료 토스트를, 'next'이면 다음 단계 이동을 수행합니다.
 *
 * ### 주의할 점
 * 다음 단계의 필수값 검증은 호출하는 폼의 handleSubmit에서 먼저 수행합니다.
 * validateDraft는 임시 저장과 다음 단계 이동 모두에 적용할 추가 검증이며,
 * false를 반환하면 API 요청을 중단합니다. 필드 오류 표시는 해당 콜백에서 처리합니다.
 * onValidationErrors에는 폼 필드로 변환된 서버 오류가 전달되며,
 * 각 폼은 자기 단계의 오류만 적용합니다. 요청 데이터 변환은 saveDraft에서 담당합니다.
 *
 * @example
 * ```tsx
 * const saveStep = useCoverLetterStepSave(options);
 * // 다음 단계는 폼 필수값 검증 후 호출합니다.
 * const onValidSubmit = (values: FormValues) => saveStep(values, { intent: 'next' });
 * const saveDraft = () => saveStep(getValues(), { intent: 'draft' });
 * ```
 */
export function useCoverLetterStepSave<Values>({
  coverLetterId,
  nextStep,
  clearErrors,
  saveDraft,
  validateDraft,
  onValidationErrors,
  errorMessage,
}: CoverLetterStepSaveOptions<Values>) {
  const router = useRouter();
  const isSavingRef = useRef(false);
  const { setErrors } = useCoverLetterCreateValidation();
  const currentStep = nextStep - 1;

  return async (values: Values, { intent }: { intent: 'draft' | 'next' }) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      clearErrors();
      if (validateDraft && !validateDraft(values)) return;
      await saveDraft(values);
      // 오류가 있는 단계를 방문해도 표시는 유지하고, 저장에 성공했을 때 해제합니다.
      setErrors((errors) => errors.filter((error) => error.step !== currentStep));
      if (intent === 'next') {
        router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, nextStep));
      } else {
        appToast.success('임시 저장되었습니다.');
      }
    } catch (error) {
      const isValidationError = error instanceof ApiError && error.code === 'VALIDATION_ERROR';
      if (isValidationError) {
        const fieldErrors = mapCoverLetterValidationErrors(error.details).filter(
          (error) => error.step === currentStep
        );
        setErrors((errors) => [
          ...errors.filter((error) => error.step !== currentStep),
          ...fieldErrors,
        ]);
        onValidationErrors(fieldErrors, values);
      }
      appToast.error(isValidationError ? '입력 내용을 확인하고 다시 저장해 주세요.' : errorMessage);
    } finally {
      isSavingRef.current = false;
    }
  };
}
