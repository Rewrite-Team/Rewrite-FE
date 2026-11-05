'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coverLetterQueryKeys } from '@/entities/cover-letter';
import { requestReReview, reviewVersionQueryKeys } from '@/entities/review-version';
import { appToast } from '@/shared/lib/toast';

/** 재첨삭을 요청하고 최신 자기소개서와 버전 목록 캐시를 갱신합니다. */
export function useRequestReReview(coverLetterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestInstruction: string) =>
      requestReReview(coverLetterId, { requestInstruction }),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: coverLetterQueryKeys.detail(coverLetterId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: reviewVersionQueryKeys.list(coverLetterId) }),
      ]);
    },
    onError: () => {
      appToast.error('AI 첨삭을 다시 요청하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });
}
