'use client';

import type { ReactNode } from 'react';

import { redirect, usePathname } from 'next/navigation';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions } from '@/entities/cover-letter';
import {
  reviewVersionListQueryOptions,
  reviewVersionDetailQueryOptions,
  createReviewVersionPanelData,
} from '@/entities/review-version';
import { ROUTES } from '@/shared/constants/routes';
import { CoverLetterDetailSkeleton } from '@/widgets/cover-letter-detail';

import { WritingDetailLayoutClient } from './WritingDetailLayoutClient';

interface WritingDetailDataLayoutClientProps {
  writingId: string;
  children: ReactNode;
}

/** 버전 패널을 샘플 대신 서버의 실제 버전 목록으로 구성합니다. */
export function WritingDetailDataLayoutClient({
  writingId,
  children,
}: WritingDetailDataLayoutClientProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isDetailPage = pathname === ROUTES.WRITING_DETAIL(writingId);
  const detailQuery = useQuery({
    ...coverLetterDetailQueryOptions(writingId),
    enabled: isDetailPage,
  });
  // 상세 URL로 직접 들어온 경우에도 작성 중 여부를 확인한 다음 버전을 조회합니다.
  const { data, isLoading, isError } = useQuery({
    ...reviewVersionListQueryOptions(writingId),
    enabled:
      !isDetailPage ||
      (Boolean(detailQuery.data) && detailQuery.data?.coverLetter.displayStatus !== 'WRITING'),
  });
  if (isDetailPage && detailQuery.data?.coverLetter.displayStatus === 'WRITING') {
    redirect(ROUTES.WRITING_CREATE_STEP(writingId, 1));
  }
  if ((isDetailPage && detailQuery.isPending) || isLoading) return <CoverLetterDetailSkeleton />;
  const { versions, initialSelectedVersionId } = createReviewVersionPanelData(data?.items ?? []);
  return (
    <WritingDetailLayoutClient
      coverLetterTitle={detailQuery.data?.coverLetter.title}
      isReviewing={detailQuery.data?.coverLetter.displayStatus === 'REVIEWING'}
      writingId={writingId}
      versions={versions}
      initialSelectedVersionId={initialSelectedVersionId}
      beforeVersionSelect={async (versionId) => {
        await queryClient.fetchQuery(reviewVersionDetailQueryOptions(writingId, versionId));
      }}
    >
      {isError ? (
        <p role="alert" className="text-error-500">
          버전 목록을 불러오지 못했습니다.
        </p>
      ) : null}
      {children}
    </WritingDetailLayoutClient>
  );
}
