'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

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
  // 상세 경로에서만 본문과 버전 목록을 병렬 조회해 하위 페이지의 불필요한 요청을 줄입니다.
  useQuery({
    ...coverLetterDetailQueryOptions(writingId),
    enabled: pathname === ROUTES.WRITING_DETAIL(writingId),
  });
  const { data, isPending, isError } = useQuery(reviewVersionListQueryOptions(writingId));
  if (isPending) return <CoverLetterDetailSkeleton />;
  const { versions, initialSelectedVersionId } = createReviewVersionPanelData(data?.items ?? []);
  return (
    <WritingDetailLayoutClient
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
