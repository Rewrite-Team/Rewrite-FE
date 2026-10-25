'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterPreferences,
  type CoverLetterDetailResponse,
  type SavePreferencesRequest,
} from '@/entities/cover-letter';

import { useCoverLetterSaveError } from './useCoverLetterSaveError';
import { getSaveDraftMutationKey } from '../model/createMutationKeys';

/** 우대사항을 저장하고 등록 화면의 상세 캐시에 저장된 값을 반영합니다. */
export function useSaveCoverLetterPreferences(coverLetterId: string) {
  const queryClient = useQueryClient();
  const handleSaveError = useCoverLetterSaveError(
    coverLetterId,
    2,
    '우대사항을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  );

  return useMutation({
    mutationKey: getSaveDraftMutationKey(coverLetterId),
    mutationFn: (values: SavePreferencesRequest) =>
      saveCoverLetterPreferences(coverLetterId, values),
    retry: false,
    onError: handleSaveError,
    onSuccess: (_, values) => {
      queryClient.setQueryData<CoverLetterDetailResponse>(
        coverLetterQueryKeys.detail(coverLetterId),
        (previous) =>
          previous
            ? {
                ...previous,
                coverLetter: { ...previous.coverLetter, preferences: values.preferences ?? null },
              }
            : previous
      );
    },
  });
}
