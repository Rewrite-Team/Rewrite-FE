'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coverLetterQueryKeys, deleteCoverLetter } from '@/entities/cover-letter';
import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';

/**
 * ## useDeleteCoverLetter
 *
 * @description
 * 삭제 확인 후 자기소개서를 제거하고 상세 캐시와 목록을 갱신합니다.
 * 이미 삭제된 대상의 404는 삭제 완료로 취급하며, 다른 실패는 토스트로 안내합니다.
 * 상태 변경 요청은 자동 재시도하지 않습니다.
 */
export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cover-letter-delete'],
    mutationFn: async (coverLetterId: string) => {
      try {
        await deleteCoverLetter(coverLetterId);
      } catch (error) {
        // 서버 명세에 따라 이미 없는 자기소개서도 삭제가 완료된 것으로 처리합니다.
        if (!(error instanceof ApiError && error.status === 404)) throw error;
      }
    },
    retry: false,
    onSuccess: async (_, coverLetterId) => {
      await queryClient.cancelQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.lists() });
    },
    onError: () => {
      appToast.error('자기소개서를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });
}
