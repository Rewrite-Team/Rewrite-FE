'use client';

import { CoverLetterCard, useCoverLetterList } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';
import { Pagination } from '@/shared/ui/pagination';
import { EmptyState, ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterListSkeleton } from './CoverLetterListSkeleton';

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
  const { data, isPending, isFetching, refetch } = useCoverLetterList(requestedPage);

  const handleRetry = () => {
    void refetch();
  };

  if (isPending) {
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

  if (coverLetters.length === 0) {
    return (
      <EmptyState
        className="mt-9 self-center lg:min-h-127.5"
        description="새로운 자기소개서를 작성해 보세요."
        title="아직 작성한 자기소개서가 없어요"
      />
    );
  }

  return (
    <>
      <ul className="mt-9 grid grid-cols-1 content-start gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {coverLetters.map((coverLetter) => (
          <CoverLetterCard coverLetter={coverLetter} key={coverLetter.id} />
        ))}
      </ul>

      {totalPages > 1 ? (
        <Pagination
          className="mt-16 lg:mt-20"
          currentPage={page}
          pathname={ROUTES.WRITING}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}
