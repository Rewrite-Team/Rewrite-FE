'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import {
  COVER_LETTER_LIST_DEFAULT_PAGE,
  CoverLetterCard,
  coverLetterListQueryOptions,
  useCoverLetterList,
  type CoverLetterListItemResponse,
} from '@/entities/cover-letter';
import { useDeleteCoverLetter } from '@/features/cover-letter/delete';
import { DeleteIcon } from '@/shared/assets/icons/side-menu';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Pagination } from '@/shared/ui/pagination';
import { EmptyState, ErrorState } from '@/shared/ui/state-feedback';
import { Tooltip } from '@/shared/ui/tooltip';

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
  const deleteMutation = useDeleteCoverLetter();
  const [deleteTarget, setDeleteTarget] = useState<CoverLetterListItemResponse | null>(null);
  const { data, isPending, isFetching, isRefetchError, errorUpdatedAt, refetch } =
    useCoverLetterList(requestedPage);
  const { isRefreshing: isStreamRefreshing, hasRefreshTimedOut } =
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
    // 쿼리 취소로 이전 상태가 복원된 시간 초과도 같은 경로에서 안내해 중복 토스트를 방지합니다.
    if ((isRefetchError || hasRefreshTimedOut) && !isStreamRefreshing) {
      appToast.error('목록을 새로 불러오지 못했어요. 이전 조회 결과를 표시합니다.');
    }
  }, [isRefetchError, errorUpdatedAt, isStreamRefreshing, hasRefreshTimedOut]);

  const handleRetry = () => {
    void refetch().then((result) => {
      if (result.isError) appToast.error('목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    });
  };

  const handlePrefetchPage = (page: number) => {
    if (!data || page === data.page || page < 1 || page > data.totalPages) {
      return;
    }

    // 같은 query key와 캐시 기준을 사용해 프리패칭 이후 페이지 이동 시 중복 요청을 줄입니다.
    void queryClient.prefetchQuery(coverLetterListQueryOptions(page));
  };

  if (isPending || isOutOfRange || (!data && isStreamRefreshing)) {
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
            <CoverLetterCard
              coverLetter={coverLetter}
              key={coverLetter.id}
              actions={
                <Tooltip.Root placement="top" offset={8}>
                  <Tooltip.Trigger
                    render={
                      <Button
                        aria-label={`${coverLetter.title?.trim() || '제목 없는 자기소개서'} 삭제`}
                        className="size-9 rounded-xl border border-white/10 bg-gray-900/70 text-gray-100 shadow-sm backdrop-blur-md data-[disabled=false]:hover:bg-gray-900 data-[disabled=false]:hover:text-error-400"
                        disabled={deleteMutation.isPending}
                        iconOnly
                        onClick={() => setDeleteTarget(coverLetter)}
                        variant="ghost"
                      >
                        <DeleteIcon aria-hidden="true" className="size-3.5" />
                      </Button>
                    }
                  />
                  <Tooltip.Content>자기소개서 삭제</Tooltip.Content>
                </Tooltip.Root>
              }
            />
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
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        title={
          <>
            <span
              className="body-16 mb-2 block wrap-break-word font-medium text-white"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
              }}
            >
              {deleteTarget?.title?.trim() || '제목 없는 자기소개서'}
            </span>
            이 자기소개서를 삭제할까요?
          </>
        }
        description={
          <>
            삭제 후에는 복구할 수 없습니다.
            {deleteTarget?.displayStatus === 'REVIEWING' ? (
              <>
                <br />
                진행 중인 AI 첨삭도 중단됩니다.
              </>
            ) : null}
          </>
        }
        cancelLabel="취소"
        confirmLabel="삭제하기"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget || deleteMutation.isPending) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </>
  );
}
