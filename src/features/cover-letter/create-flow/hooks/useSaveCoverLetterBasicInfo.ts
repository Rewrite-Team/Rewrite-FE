'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterBasicInfo,
  type CoverLetterDetailResponse,
  type SaveBasicInfoRequest,
} from '@/entities/cover-letter';

import { useCoverLetterSaveError } from './useCoverLetterSaveError';
import { getSaveDraftMutationKey } from '../model/createMutationKeys';

/**
 * ## useIsSavingCoverLetterDraft
 *
 * @description
 * 같은 자기소개서의 단계별 저장 또는 최종 제출이 진행 중인지 구독합니다.
 * 폼 바깥의 단계 패널에서도 저장·다음·제출 버튼을 잠그는 데 사용합니다.
 * 저장과 제출 mutation이 동일한 키를 사용해야 전체 작성 흐름의 잠금이 유지됩니다.
 *
 * @example
 * ```tsx
 * const isSaving = useIsSavingCoverLetterDraft(coverLetterId);
 * <Button disabled={isSaving}>임시 저장</Button>
 * ```
 */
export const useIsSavingCoverLetterDraft = (coverLetterId: string) =>
  useIsMutating({ mutationKey: getSaveDraftMutationKey(coverLetterId) }) > 0;

/** 기본 정보를 저장하고 등록 화면의 상세 캐시에 저장된 값을 반영합니다. */
export function useSaveCoverLetterBasicInfo(coverLetterId: string) {
  const queryClient = useQueryClient();
  const handleSaveError = useCoverLetterSaveError(
    coverLetterId,
    1,
    '기본 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  );

  return useMutation({
    mutationKey: getSaveDraftMutationKey(coverLetterId),
    mutationFn: (values: SaveBasicInfoRequest) => saveCoverLetterBasicInfo(coverLetterId, values),
    retry: false,
    onError: handleSaveError,
    onSuccess: (_, values) => {
      queryClient.setQueryData<CoverLetterDetailResponse>(
        coverLetterQueryKeys.detail(coverLetterId),
        (previous) =>
          previous
            ? {
                ...previous,
                coverLetter: {
                  ...previous.coverLetter,
                  title: values.title ?? null,
                  companyName: values.companyName ?? null,
                  positionTitle: values.positionTitle ?? null,
                  jobPostingUrl: values.jobPostingUrl ?? null,
                },
              }
            : previous
      );
      void queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
    },
  });
}
