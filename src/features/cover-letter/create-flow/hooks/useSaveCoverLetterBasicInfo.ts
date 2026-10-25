'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterBasicInfo,
  type CoverLetterDetailResponse,
  type SaveBasicInfoRequest,
} from '@/entities/cover-letter';

import { useCoverLetterSaveError } from './useCoverLetterSaveError';
import { getCoverLetterCreateMutationKey } from '../model/createMutationKeys';

/** 기본 정보를 저장하고 등록 화면의 상세 캐시에 저장된 값을 반영합니다. */
export function useSaveCoverLetterBasicInfo(coverLetterId: string) {
  const queryClient = useQueryClient();
  const handleSaveError = useCoverLetterSaveError(
    coverLetterId,
    1,
    '기본 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  );

  return useMutation({
    mutationKey: getCoverLetterCreateMutationKey(coverLetterId),
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
