'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coverLetterQueryKeys, submitCoverLetter } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';

import { getSaveDraftMutationKey } from '../model/createMutationKeys';

/** 최종 제출을 확정하고 최초 AI 첨삭을 요청합니다. */
export function useSubmitCoverLetter(coverLetterId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getSaveDraftMutationKey(coverLetterId),
    mutationFn: () => submitCoverLetter(coverLetterId),
    retry: false,
    onSuccess: ({ displayStatus, jobId }) => {
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
  });
}
