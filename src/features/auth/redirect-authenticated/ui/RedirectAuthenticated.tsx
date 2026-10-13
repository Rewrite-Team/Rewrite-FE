'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { coverLetterListQueryOptions } from '@/entities/cover-letter';
import { currentUserQueryOptions } from '@/entities/user';
import { ROUTES } from '@/shared/constants/routes';

interface RedirectAuthenticatedProps {
  children: React.ReactNode;
}

/** 로그인한 사용자가 로그인 화면에 머물지 않도록 작성물 목록으로 보냅니다. */
export function RedirectAuthenticated({ children }: RedirectAuthenticatedProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(currentUserQueryOptions);

  useEffect(() => {
    if (user) {
      void queryClient.prefetchQuery(coverLetterListQueryOptions());
      router.replace(ROUTES.WRITING);
    }
  }, [queryClient, router, user]);

  return children;
}
