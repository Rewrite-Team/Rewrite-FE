'use client';

import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { coverLetterListQueryOptions } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';

import { consumeReturnTo } from '../model/returnTo';

/**
 * ## useLoginDestination
 *
 * @description
 * 인증 확인 후 호출할 복귀 경로 결정 함수를 반환합니다. 저장된 경로를 한 번 소비하고,
 * 목적지가 목록이면 해당 페이지만 프리패칭하며 조회 완료를 기다리지 않습니다.
 * 보호 페이지의 인증 가드가 로그인 복귀 후 목적지와 프리패칭을 결정할 때 사용합니다.
 *
 * @returns 저장된 복귀 경로 또는 전달한 기본 경로를 반환하는 함수입니다.
 */
export const useLoginDestination = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (fallbackPath: string = ROUTES.WRITING) => {
      const path = consumeReturnTo() ?? fallbackPath;
      const destination = new URL(path, window.location.origin);

      if (destination.pathname === ROUTES.WRITING) {
        void queryClient.prefetchQuery(
          coverLetterListQueryOptions(Number(destination.searchParams.get('page')))
        );
      }

      return path;
    },
    [queryClient]
  );
};
