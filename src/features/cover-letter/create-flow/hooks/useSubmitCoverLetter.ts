'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  fetchLatestCoverLetterDetail,
  submitCoverLetter,
  type CoverLetterDetailResponse,
} from '@/entities/cover-letter';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';

import { getCoverLetterCreateMutationKey } from '../model/createMutationKeys';
import { mapCoverLetterValidationErrors } from '../model/mapCoverLetterValidationErrors';
import { useCoverLetterCreateValidation } from '../ui/CoverLetterCreateDraftContext';

interface SubmitCoverLetterOptions {
  /** 검증 오류가 있는 단계로 이동하기 전에 확인 모달 등 현재 UI를 닫습니다. */
  onValidationRedirect?: () => void;
}

/**
 * ## useSubmitCoverLetter
 *
 * @description
 * 최종 제출과 최초 AI 첨삭을 요청하고 결과에 따른 캐시 갱신·오류 안내·이동을 처리합니다.
 * 검증 오류는 작성 Context로 전달하고 첫 오류 단계로 이동합니다.
 * 제출 충돌 시에는 최신 상세 캐시를 확인한 후 기존 결과로 이동합니다.
 * 모달 열림 상태는 호출 화면에서 관리하며, onValidationRedirect에서 이동 전에 닫을 수 있습니다.
 */
export function useSubmitCoverLetter(
  coverLetterId: string,
  { onValidationRedirect }: SubmitCoverLetterOptions = {}
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setErrors } = useCoverLetterCreateValidation();
  return useMutation({
    mutationKey: getCoverLetterCreateMutationKey(coverLetterId),
    mutationFn: () => submitCoverLetter(coverLetterId),
    retry: false,
    onMutate: () => setErrors([]),
    onSuccess: ({ displayStatus, jobId }) => {
      // 상세 화면이 이전 WRITING 캐시를 읽고 작성 단계로 되돌아가지 않도록 먼저 반영합니다.
      queryClient.setQueryData<CoverLetterDetailResponse>(
        coverLetterQueryKeys.detail(coverLetterId),
        (previous) =>
          previous
            ? { ...previous, coverLetter: { ...previous.coverLetter, displayStatus } }
            : previous
      );
      const detailRoute = ROUTES.WRITING_DETAIL(coverLetterId);
      router.replace(
        displayStatus === 'REVIEWING' && jobId
          ? `${detailRoute}?jobId=${encodeURIComponent(jobId)}`
          : detailRoute
      );
      void queryClient.invalidateQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
      void queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        const errors = mapCoverLetterValidationErrors(error.details);
        setErrors(errors);
        if (errors.length > 0) {
          onValidationRedirect?.();
          router.replace(
            ROUTES.WRITING_CREATE_STEP(
              coverLetterId,
              Math.min(...errors.map((error) => error.step))
            )
          );
        }
        appToast.error('입력 내용을 확인하고 다시 제출해 주세요.');
      } else if (error instanceof ApiError && error.status === 404) {
        appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
        router.replace(ROUTES.WRITING);
      } else if (error instanceof ApiError && error.code === 'CONFLICT') {
        appToast.error('이미 첨삭된 자기소개서입니다. 기존 결과를 확인해 주세요.');
        try {
          // 이전 WRITING 캐시 때문에 작성 화면으로 되돌아가지 않도록 먼저 갱신합니다.
          await fetchLatestCoverLetterDetail(queryClient, coverLetterId);
        } catch {
          appToast.error('기존 첨삭 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
        router.replace(ROUTES.WRITING_DETAIL(coverLetterId));
      } else {
        appToast.error(
          error instanceof ApiError && error.code === 'LLM_JOB_ALREADY_RUNNING'
            ? '다른 AI 작업이 진행 중입니다. 완료 후 다시 시도해 주세요.'
            : '자기소개서를 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.'
        );
      }
    },
  });
}
