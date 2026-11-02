'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  coverLetterQueryKeys,
  submitCoverLetter,
  type CoverLetterStatus,
  type CoverLetterDetailResponse,
} from '@/entities/cover-letter';
import {
  requestReReview,
  reviewVersionListQueryOptions,
  reviewVersionQueryKeys,
} from '@/entities/review-version';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';

interface RetryCoverLetterReviewResponse {
  displayStatus: CoverLetterStatus;
  jobId: string | null;
}

/** 실패한 첨삭을 다시 요청하고 새 Job의 상세 화면으로 연결합니다. */
export function useRetryCoverLetterReview(coverLetterId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (): Promise<RetryCoverLetterReviewResponse> => {
      const versions = await queryClient.fetchQuery(reviewVersionListQueryOptions(coverLetterId));
      const hasReviewedVersion = versions.items.some((version) => version.isLatestReviewed);

      if (hasReviewedVersion) return requestReReview(coverLetterId);
      return submitCoverLetter(coverLetterId);
    },
    retry: false,
    onSuccess: ({ displayStatus, jobId }) => {
      queryClient.setQueryData<CoverLetterDetailResponse>(
        coverLetterQueryKeys.detail(coverLetterId),
        (previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            coverLetter: { ...previous.coverLetter, displayStatus },
            reviewJob:
              displayStatus === 'REVIEWING' && jobId
                ? {
                    id: jobId,
                    status: 'PENDING',
                    progress: {
                      current: 0,
                      total: previous.questions.length,
                      message: '첨삭을 준비하고 있습니다.',
                    },
                    error: null,
                  }
                : previous.reviewJob,
          };
        }
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
      void queryClient.invalidateQueries({ queryKey: reviewVersionQueryKeys.list(coverLetterId) });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
        router.replace(ROUTES.WRITING);
        return;
      }

      appToast.error(
        error instanceof ApiError && error.code === 'LLM_JOB_ALREADY_RUNNING'
          ? '다른 AI 작업이 진행 중입니다. 완료 후 다시 시도해 주세요.'
          : 'AI 첨삭을 다시 요청하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      void queryClient.invalidateQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
      void queryClient.invalidateQueries({ queryKey: reviewVersionQueryKeys.list(coverLetterId) });
    },
  });
}
