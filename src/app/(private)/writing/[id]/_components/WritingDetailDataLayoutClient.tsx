'use client';

import type { ReactNode } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoverLetterDetail } from '@/entities/cover-letter';
import {
  reviewVersionListQueryOptions,
  reviewVersionDetailQueryOptions,
  type ReviewVersionSummary,
} from '@/entities/review-version';
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
  useCoverLetterDetail(writingId);
  const { data, isPending, isError } = useQuery(reviewVersionListQueryOptions(writingId));
  if (isPending) return <CoverLetterDetailSkeleton />;
  const items = [...(data?.items ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const versions: ReviewVersionSummary[] = items.map((item) => ({
    id: item.id,
    label: item.version,
    createdAt: item.createdAt,
    status:
      item.status === 'COMPLETED'
        ? 'COMPLETED'
        : item.status === 'FAILED' || item.status === 'CANCELED'
          ? 'FAILED'
          : 'GENERATING',
  }));
  const selected =
    items.find((item) => item.isLatestReviewed)?.id ??
    items.findLast((item) => item.status === 'COMPLETED')?.id ??
    '';
  return (
    <WritingDetailLayoutClient
      writingId={writingId}
      versions={versions}
      initialSelectedVersionId={selected}
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
