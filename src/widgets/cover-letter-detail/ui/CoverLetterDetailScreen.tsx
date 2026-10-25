'use client';

import { redirect, useRouter, useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions } from '@/entities/cover-letter';
import { reviewVersionDetailQueryOptions } from '@/entities/review-version';
import { useReviewVersion } from '@/features/review-version/version-management';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterDetailSkeleton } from './CoverLetterDetailSkeleton';
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
  const { selectedVersionId } = useReviewVersion();
  const { data, isPending, isFetching, refetch } = useQuery({
    ...coverLetterDetailQueryOptions(coverLetterId),
    refetchOnMount: false,
  });
  const jobId =
    data?.coverLetter.displayStatus === 'REVIEWING'
      ? (data.reviewJob?.id ?? searchParams.get('jobId') ?? undefined)
      : undefined;
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

  const handleDetailRetry = async () => {
    const refreshedDetail = await refetch();
    if (!refreshedDetail.isError) return;
    if (refreshedDetail.error instanceof ApiError && refreshedDetail.error.status === 404) {
      appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
      router.replace(ROUTES.WRITING);
    } else {
      appToast.error('자기소개서 상태를 새로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleVersionRetry = async () => {
    const refreshedVersion = await versionQuery.refetch();
    if (refreshedVersion.isError)
      appToast.error('선택한 버전을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  };

  if (isPending) return <CoverLetterDetailSkeleton />;
  if (!data)
    return (
      <ErrorState
        title="자기소개서를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        retry={{ onClick: () => void handleDetailRetry(), isLoading: isFetching }}
      />
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
  if (hasReviewFailed)
    return (
      <section className="writing-detail-content">
        <PageHeader title={data.coverLetter.title ?? '자기소개서'} />
        <ErrorState
          title="AI 첨삭을 완료하지 못했어요"
          description={
            reviewJob.jobState?.error?.message ??
            data.reviewJob?.error?.message ??
            '첨삭 작업이 중단되었습니다.'
          }
          retry={{ label: '상태 새로고침', onClick: handleRefresh, isLoading: isFetching }}
        />
        <LinkButton href={ROUTES.WRITING} variant="outline">
          목록으로 이동
        </LinkButton>
      </section>
    );

  if (data.coverLetter.displayStatus === 'REVIEWING') {
    const progress = reviewJob.jobState?.progress ?? data.reviewJob?.progress;
    return (
      <CoverLetterReviewProgress
        title={data.coverLetter.title ?? '자기소개서'}
        progress={progress}
        questionResults={reviewJob.questionResults}
        hasJobId={Boolean(jobId)}
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
      <ErrorState
        title="선택한 버전을 불러오지 못했어요"
        retry={{ onClick: () => void handleVersionRetry(), isLoading: versionQuery.isFetching }}
      />
    );

  return <CoverLetterReviewResult detail={displayedDetail} />;
}
