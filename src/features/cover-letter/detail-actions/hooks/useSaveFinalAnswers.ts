'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coverLetterQueryKeys } from '@/entities/cover-letter';
import { reviewVersionQueryKeys, saveFinalAnswers } from '@/entities/review-version';
import { appToast } from '@/shared/lib/toast';

/** 최종 작성본을 저장하고 해당 버전 및 버전 목록 캐시를 갱신합니다. */
export function useSaveFinalAnswers(coverLetterId: string, versionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Parameters<typeof saveFinalAnswers>[2]) =>
      saveFinalAnswers(coverLetterId, versionId, answers),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: coverLetterQueryKeys.detail(coverLetterId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: reviewVersionQueryKeys.detail(coverLetterId, versionId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: reviewVersionQueryKeys.list(coverLetterId) }),
      ]);
      appToast.success('최종 작성본을 저장했습니다.');
    },
    onError: () => {
      appToast.error('최종 작성본을 저장하지 못했습니다. 변경 내용을 확인해 주세요.');
    },
  });
}
