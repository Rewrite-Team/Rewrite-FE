'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import {
  COVER_LETTER_LIST_DEFAULT_PAGE,
  CoverLetterCard,
  coverLetterListQueryOptions,
  useCoverLetterList,
} from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Pagination } from '@/shared/ui/pagination';
import { EmptyState, ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterListSkeleton } from './CoverLetterListSkeleton';
import { useCoverLetterReviewStatusStream } from './hooks/useCoverLetterReviewStatusStream';

interface CoverLetterListProps {
  requestedPage: number;
}

/**
 * ## CoverLetterList
 *
 * @description
 * 자기소개서 목록 페이지의 빈 상태, 카드 그리드와 페이지네이션을 조립합니다.
 */
export function CoverLetterList({ requestedPage }: CoverLetterListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isFetching, isRefetchError, errorUpdatedAt, refetch } =
    useCoverLetterList(requestedPage);
  useCoverLetterReviewStatusStream();
  const recoveryPage = Math.max(data?.totalPages ?? 0, COVER_LETTER_LIST_DEFAULT_PAGE);
  const isOutOfRange = Boolean(data && requestedPage > recoveryPage);

  useEffect(() => {
    if (isOutOfRange) {
      // 잘못된 페이지를 방문 기록에 남기지 않고 서버의 최신 페이지 범위로 복구합니다.
      router.replace(`${ROUTES.WRITING}?page=${recoveryPage}`, { scroll: false });
    }
  }, [isOutOfRange, recoveryPage, router]);

  useEffect(() => {
    if (isRefetchError) {
      appToast.error('목록을 새로 불러오지 못했어요. 이전 조회 결과를 표시합니다.');
    }
  }, [isRefetchError, errorUpdatedAt]);

  const handleRetry = () => {
    void refetch();
  };

  const handlePrefetchPage = (page: number) => {
    if (!data || page === data.page || page < 1 || page > data.totalPages) {
      return;
    }

    // 같은 query key와 캐시 기준을 사용해 프리패칭 이후 페이지 이동 시 중복 요청을 줄입니다.
    void queryClient.prefetchQuery(coverLetterListQueryOptions(page));
  };

  if (isPending || isOutOfRange) {
    return <CoverLetterListSkeleton />;
  }

  if (!data) {
    return (
      <ErrorState
        className="mt-9 self-center lg:min-h-127.5"
        description="잠시 후 다시 시도해 주세요."
        retry={{ onClick: handleRetry, isLoading: isFetching, disabled: isFetching }}
        title="자기소개서를 불러오지 못했어요"
      />
    );
  }

  const { items: coverLetters, page, totalPages } = data;
  const hasCoverLetters = coverLetters.length > 0;

  return (
    <>
      {hasCoverLetters ? (
        <ul className="mt-9 grid grid-cols-1 content-start gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((coverLetter) => (
            <CoverLetterCard coverLetter={coverLetter} key={coverLetter.id} />
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-9 self-center lg:min-h-127.5"
          description="새로운 자기소개서를 작성해 보세요."
          title="아직 작성한 자기소개서가 없어요"
        />
      )}

      {hasCoverLetters && totalPages > 1 ? (
        <Pagination
          className="mt-16 lg:mt-20"
          currentPage={page}
          onPrefetchPage={handlePrefetchPage}
          pathname={ROUTES.WRITING}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}
