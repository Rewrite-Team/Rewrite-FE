'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  saveCoverLetterQuestions,
  type SaveQuestionsRequest,
} from '@/entities/cover-letter';

import { getSaveDraftMutationKey } from '../model/createMutationKeys';

/** 문항 전체를 저장한 뒤 서버에서 부여한 문항 ID와 순서를 재조회합니다. */
export function useSaveCoverLetterQuestions(coverLetterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getSaveDraftMutationKey(coverLetterId),
    mutationFn: (values: SaveQuestionsRequest) => saveCoverLetterQuestions(coverLetterId, values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
    },
  });
}
