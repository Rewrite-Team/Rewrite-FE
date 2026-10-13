'use client';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { createCoverLetter } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';

/** 새 자기소개서 초안을 만들고 반환된 ID를 포함한 등록 STEP1으로 이동합니다. */
export function CreateCoverLetterButton() {
  const router = useRouter();
  const createMutation = useMutation({
    mutationFn: () => createCoverLetter(),
    onError: () => {
      appToast.error('자기소개서를 시작하지 못했습니다. 다시 시도해 주세요.');
    },
    onSuccess: ({ id }) => {
      router.push(ROUTES.WRITING_CREATE_STEP(id, 1));
    },
  });

  return (
    <Button
      className="h-9 w-auto rounded-full px-4 body-16"
      isLoading={createMutation.isPending}
      onClick={() => createMutation.mutate()}
      variant="outline"
    >
      CREATE
    </Button>
  );
}
