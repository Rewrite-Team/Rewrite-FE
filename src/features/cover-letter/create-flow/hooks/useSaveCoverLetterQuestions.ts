'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterQuestions,
  type SaveQuestionsRequest,
} from '@/entities/cover-letter';

import { useCoverLetterSaveError } from './useCoverLetterSaveError';
import { getCoverLetterCreateMutationKey } from '../model/createMutationKeys';

/** 문항 전체를 저장한 뒤 서버에서 부여한 문항 ID와 순서를 재조회합니다. */
export function useSaveCoverLetterQuestions(coverLetterId: string) {
  const queryClient = useQueryClient();
  const handleSaveError = useCoverLetterSaveError(
    coverLetterId,
    3,
    '문항과 답변을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  );

  return useMutation({
    mutationKey: getCoverLetterCreateMutationKey(coverLetterId),
    mutationFn: (values: SaveQuestionsRequest) => saveCoverLetterQuestions(coverLetterId, values),
    retry: false,
    onError: handleSaveError,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
    },
  });
}
