'use client';

import { useQuery } from '@tanstack/react-query';

import { coverLetterListQueryOptions } from '../api/queries';

/**
 * ## useCoverLetterList
 *
 * @description
 * URL에서 결정한 페이지의 자기소개서 목록을 6개씩 조회합니다.
 * API 응답을 그대로 반환하며 페이지마다 별도의 query key로 캐시를 관리합니다.
 *
 * @param requestedPage - 1부터 시작하는 페이지 번호입니다. 잘못된 값은 1로 정규화합니다.
 * @example
 * ```tsx
 * const { data, isPending, error, refetch } = useCoverLetterList(requestedPage);
 * ```
 */
export const useCoverLetterList = (requestedPage?: number) =>
  useQuery(coverLetterListQueryOptions(requestedPage));
