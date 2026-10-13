'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterBasicInfo,
  type CoverLetterDetailResponse,
  type SaveBasicInfoRequest,
} from '@/entities/cover-letter';

const getSaveDraftMutationKey = (coverLetterId: string) =>
  ['cover-letter-create', coverLetterId, 'save'] as const;

export const useIsSavingCoverLetterDraft = (coverLetterId: string) =>
  useIsMutating({ mutationKey: getSaveDraftMutationKey(coverLetterId) }) > 0;

/** 기본 정보를 저장하고 등록 화면의 상세 캐시에 저장된 값을 반영합니다. */
export function useSaveCoverLetterBasicInfo(coverLetterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getSaveDraftMutationKey(coverLetterId),
    mutationFn: (values: SaveBasicInfoRequest) => saveCoverLetterBasicInfo(coverLetterId, values),
    retry: false,
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
