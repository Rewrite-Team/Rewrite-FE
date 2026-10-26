'use client';

import { startTransition, useEffect, useState } from 'react';

import { redirect, useRouter, useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions } from '@/entities/cover-letter';
import { reviewVersionDetailQueryOptions } from '@/entities/review-version';
import { useReviewVersion } from '@/features/review-version/version-management';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { LinkButton } from '@/shared/ui/button';
import { EmptyState, ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterDetailSkeleton } from './CoverLetterDetailSkeleton';
import { CoverLetterReviewFailure } from './CoverLetterReviewFailure';
import { CoverLetterReviewProgress } from './CoverLetterReviewProgress';
import { CoverLetterReviewResult } from './CoverLetterReviewResult';
import { useCoverLetterReviewJob } from '../hooks/useCoverLetterReviewJob';

interface CoverLetterDetailScreenProps {
  coverLetterId: string;
}

/** 실제 첨삭 진행 상태와 서버에 저장된 완료 버전 결과를 표시합니다. */
export function CoverLetterDetailScreen({ coverLetterId }: CoverLetterDetailScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstEntryCompletion, setFirstEntryCompletion] = useState<{
    coverLetterId: string;
    jobId: string;
  } | null>(null);
  const { selectedVersionId } = useReviewVersion();
  const { data, error, isError, isPending, isFetching, refetch } = useQuery({
    ...coverLetterDetailQueryOptions(coverLetterId),
    refetchOnMount: false,
  });
  const jobId =
    data?.coverLetter.displayStatus === 'REVIEWING'
      ? (data.reviewJob?.id ?? searchParams.get('jobId') ?? undefined)
      : undefined;
  const completedJobId = searchParams.get('jobId');
  const reviewJob = useCoverLetterReviewJob(coverLetterId, jobId);
  const shouldFetchVersion = Boolean(
    data?.coverLetter.displayStatus === 'REVIEWED' &&
    selectedVersionId &&
    selectedVersionId !== data.reviewVersion?.id
  );
  const versionQuery = useQuery({
    ...reviewVersionDetailQueryOptions(coverLetterId, selectedVersionId),
    enabled: shouldFetchVersion,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!(error instanceof ApiError) || error.status !== 404) return;

    appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
    router.replace(ROUTES.WRITING);
  }, [error, router]);

  useEffect(() => {
    if (
      !completedJobId ||
      data?.coverLetter.displayStatus !== 'REVIEWED' ||
      data.reviewJob?.id !== completedJobId ||
      data.reviewJob.status !== 'COMPLETED'
    )
      return;

    startTransition(() => setFirstEntryCompletion({ coverLetterId, jobId: completedJobId }));
    router.replace(ROUTES.WRITING_DETAIL(coverLetterId), { scroll: false });
  }, [completedJobId, coverLetterId, data, router]);

  const handleDetailRetry = async () => {
    const refreshedDetail = await refetch();
    if (!refreshedDetail.isError) return;
    if (refreshedDetail.error instanceof ApiError && refreshedDetail.error.status === 404) return;

    appToast.error('자기소개서 상태를 새로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  };

  const handleVersionRetry = async () => {
    const refreshedVersion = await versionQuery.refetch();
    if (refreshedVersion.isError)
      appToast.error('선택한 버전을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  };

  if (isPending) return <CoverLetterDetailSkeleton />;
  if (!data && isError)
    return (
      <section className="writing-detail-content writing-detail-feedback">
        <ErrorState
          title="자기소개서를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          retry={{ onClick: () => void handleDetailRetry(), isLoading: isFetching }}
        />
      </section>
    );
  if (!data)
    return (
      <section className="writing-detail-content writing-detail-feedback">
        <EmptyState
          title="자기소개서 데이터를 찾을 수 없어요"
          description="목록으로 돌아가 다시 선택해 주세요."
        />
        <LinkButton href={ROUTES.WRITING} variant="outline">
          목록으로 이동
        </LinkButton>
      </section>
    );
  if (data.coverLetter.displayStatus === 'WRITING')
    redirect(ROUTES.WRITING_CREATE_STEP(coverLetterId, 1));

  const handleRefresh = () => {
    reviewJob.retry();
    void handleDetailRetry();
  };
  const hasReviewFailed =
    data.coverLetter.displayStatus === 'REVIEW_FAILED' ||
    reviewJob.jobState?.status === 'FAILED' ||
    reviewJob.jobState?.status === 'CANCELED';
  // TODO: 문항별 재시도 mutation을 연결해 실패 카드에 questionId를 전달하고, 성공한 문항 결과만 갱신한다.
  if (hasReviewFailed)
    return (
      <CoverLetterReviewFailure
        title={data.coverLetter.title ?? '자기소개서'}
        questions={data.questions}
        questionResults={reviewJob.questionResults}
        errorMessage={
          reviewJob.jobState?.error?.message ??
          data.reviewJob?.error?.message ??
          '첨삭 작업이 중단되었습니다.'
        }
        progress={reviewJob.jobState?.progress ?? data.reviewJob?.progress}
        isFetching={isFetching}
        onRefresh={handleRefresh}
      />
    );

  if (data.coverLetter.displayStatus === 'REVIEWING') {
    const progress = reviewJob.jobState?.progress ?? data.reviewJob?.progress;
    return (
      <CoverLetterReviewProgress
        title={data.coverLetter.title ?? '자기소개서'}
        progress={progress}
        questions={data.questions}
        questionResults={reviewJob.questionResults}
        hasJobId={Boolean(jobId)}
        isCompleted={reviewJob.jobState?.status === 'COMPLETED'}
        connectionIssue={reviewJob.connectionIssue}
        isFetching={isFetching}
        onRefresh={handleRefresh}
      />
    );
  }

  if (shouldFetchVersion && versionQuery.isPending) return <CoverLetterDetailSkeleton />;
  const displayedDetail = shouldFetchVersion ? versionQuery.data : data;
  if (!displayedDetail)
    return (
      <section className="writing-detail-content writing-detail-feedback">
        <ErrorState
          title="선택한 버전을 불러오지 못했어요"
          retry={{ onClick: () => void handleVersionRetry(), isLoading: versionQuery.isFetching }}
        />
      </section>
    );

  if (displayedDetail.questions.length === 0)
    return (
      <section className="writing-detail-content writing-detail-feedback">
        <EmptyState
          title="표시할 자기소개서 문항이 없어요"
          description="자기소개서 목록에서 다른 항목을 선택해 주세요."
        />
        <LinkButton href={ROUTES.WRITING} variant="outline">
          목록으로 이동
        </LinkButton>
      </section>
    );

  return (
    <CoverLetterReviewResult
      detail={displayedDetail}
      showCompletionNotice={
        reviewJob.hasCompletedReview ||
        (firstEntryCompletion?.coverLetterId === coverLetterId &&
          firstEntryCompletion.jobId === data.reviewJob?.id)
      }
    />
  );
}
