'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { currentUserQueryOptions } from '@/entities/user';

import { useLoginDestination } from '../hooks/useLoginDestination';

interface RedirectAuthenticatedProps {
  children: React.ReactNode;
}

/** 로그인한 사용자를 최종 복귀 경로로 이동시키고 필요한 목록 데이터를 미리 조회합니다. */
export function RedirectAuthenticated({ children }: RedirectAuthenticatedProps) {
  const router = useRouter();
  const getLoginDestination = useLoginDestination();
  const hasRedirected = useRef(false);
  const { data: user } = useQuery(currentUserQueryOptions);

  useEffect(() => {
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(getLoginDestination());
    }
  }, [getLoginDestination, router, user]);

  return children;
}
