'use client';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { fetchLatestCoverLetterDetail } from '@/entities/cover-letter';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';

import { mapCoverLetterValidationErrors } from '../model/mapCoverLetterValidationErrors';
import { useCoverLetterCreateValidation } from '../ui/CoverLetterCreateDraftContext';

import type { WritingCreateInputStep } from '../model/writingCreateStep';

/**
 * ## useCoverLetterSaveError
 *
 * @description
 * STEP1~3 저장 mutation의 onError에서 서버 검증 오류를 해당 단계에 전달하고
 * 실패 토스트를 한 번 표시합니다. 입력란 오류와 포커스는 useCoverLetterStepErrors가 적용합니다.
 * 삭제된 글은 목록으로 이동하고, 작성 상태 충돌은 최신 상세 조회 후 현재 상태 화면으로 이동합니다.
 */
export function useCoverLetterSaveError(
  coverLetterId: string,
  currentStep: WritingCreateInputStep,
  errorMessage: string
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setErrors } = useCoverLetterCreateValidation();

  return async (error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
      router.replace(ROUTES.WRITING);
      return;
    }
    if (error instanceof ApiError && error.code === 'COVER_LETTER_NOT_WRITING') {
      try {
        const detail = await fetchLatestCoverLetterDetail(queryClient, coverLetterId);
        appToast.error('작성 상태가 변경되었습니다. 현재 상태를 확인해 주세요.');
        if (detail.coverLetter.displayStatus !== 'WRITING') {
          router.replace(ROUTES.WRITING_DETAIL(coverLetterId));
        }
      } catch (refreshError) {
        if (refreshError instanceof ApiError && refreshError.status === 404) {
          appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
          router.replace(ROUTES.WRITING);
        } else {
          appToast.error('작성 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      }
      return;
    }
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
