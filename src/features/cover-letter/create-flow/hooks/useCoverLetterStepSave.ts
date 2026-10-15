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

/** 작성 단계의 저장 잠금, 오류 안내와 저장 후 이동을 처리합니다. */
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

  return async (values: Values, { intent }: { intent: 'draft' | 'next' }) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      clearErrors();
      if (validateDraft && !validateDraft(values)) return;
      await saveDraft(values);
      if (intent === 'next') {
        router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, nextStep));
      } else {
        appToast.success('임시 저장되었습니다.');
      }
    } catch (error) {
      const isValidationError = error instanceof ApiError && error.code === 'VALIDATION_ERROR';
      if (isValidationError)
        onValidationErrors(mapCoverLetterValidationErrors(error.details), values);
      appToast.error(isValidationError ? '입력 내용을 확인하고 다시 저장해 주세요.' : errorMessage);
    } finally {
      isSavingRef.current = false;
    }
  };
}
