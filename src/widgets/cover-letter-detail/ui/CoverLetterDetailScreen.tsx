'use client';

import { redirect, useRouter, useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions, CoverLetterDiff } from '@/entities/cover-letter';
import { reviewVersionDetailQueryOptions } from '@/entities/review-version';
import { useReviewVersion } from '@/features/review-version/version-management';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Accordion } from '@/shared/ui/accordion';
import { BadgeGroup } from '@/shared/ui/badge';
import { Button, LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { ErrorState } from '@/shared/ui/state-feedback';
import { TextArea } from '@/shared/ui/textarea';

import { CoverLetterContentSection } from './CoverLetterContentSection';
import { CoverLetterDetailSkeleton } from './CoverLetterDetailSkeleton';
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
  const stream = useCoverLetterReviewJob(coverLetterId, jobId);
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
    const result = await refetch();
    if (!result.isError) return;
    if (result.error instanceof ApiError && result.error.status === 404) {
      appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
      router.replace(ROUTES.WRITING);
    } else {
      appToast.error('자기소개서 상태를 새로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleVersionRetry = async () => {
    const result = await versionQuery.refetch();
    if (result.isError)
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
    stream.retry();
    void handleDetailRetry();
  };
  const failure =
    data.coverLetter.displayStatus === 'REVIEW_FAILED' ||
    stream.job?.status === 'FAILED' ||
    stream.job?.status === 'CANCELED';
  if (failure)
    return (
      <section className="writing-detail-content">
        <PageHeader title={data.coverLetter.title ?? '자기소개서'} />
        <ErrorState
          title="AI 첨삭을 완료하지 못했어요"
          description={
            stream.job?.error?.message ??
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
    const progress = stream.job?.progress ?? data.reviewJob?.progress;
    return (
      <section className="writing-detail-content">
        <PageHeader
          title={data.coverLetter.title ?? '자기소개서'}
          description="AI가 자기소개서를 첨삭하고 있습니다."
        />
        <div className="mt-9 rounded-2xl bg-gray-800 p-6">
          <p role="status" className="body-16 text-white">
            {progress?.message || '첨삭을 준비하고 있습니다.'}
          </p>
          <progress
            aria-label="AI 첨삭 진행률"
            className="mt-4 h-3 w-full accent-primary-500"
            max={progress?.total || 1}
            value={progress?.total ? Math.min(progress.current, progress.total) : undefined}
          />
          {progress?.total ? (
            <p className="mt-2 text-gray-100">
              {progress.current}/{progress.total}개 문항
            </p>
          ) : null}
          {!jobId || stream.issue ? (
            <div className="mt-4">
              <p role="alert" className="text-error-500">
                {stream.issue ?? '첨삭 작업 정보를 확인하지 못했습니다.'}
              </p>
              <Button className="mt-3" onClick={handleRefresh} isLoading={isFetching}>
                상태 새로고침
              </Button>
            </div>
          ) : null}
        </div>
        {stream.items.map((item) => (
          <article key={item.questionId} className="mt-6 rounded-2xl bg-gray-800 p-6 text-white">
            <h2 className="body-18">문항 {item.order} 첨삭 결과</h2>
            <p className="mt-3 whitespace-pre-wrap">
              {item.rewrittenAnswer ?? item.aiReport ?? '문항 결과를 준비하고 있습니다.'}
            </p>
          </article>
        ))}
      </section>
    );
  }

  if (shouldFetchVersion && versionQuery.isPending) return <CoverLetterDetailSkeleton />;
  if (shouldFetchVersion && !versionQuery.data)
    return (
      <ErrorState
        title="선택한 버전을 불러오지 못했어요"
        retry={{ onClick: () => void handleVersionRetry(), isLoading: versionQuery.isFetching }}
      />
    );
  const result = shouldFetchVersion ? versionQuery.data! : data;

  return (
    <section className="writing-detail-content">
      <PageHeader
        className="mb-10"
        title={result.coverLetter.title ?? '자기소개서'}
        version={result.reviewVersion?.version}
        eyebrow={
          <BadgeGroup
            companyName={result.coverLetter.companyName ?? ''}
            jobName={result.coverLetter.positionTitle ?? ''}
          />
        }
      />
      <div className="flex flex-col gap-15">
        {[...result.questions]
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <article key={question.questionId}>
              <Accordion defaultOpen className="rounded-2xl p-6">
                <Accordion.Header>
                  <div className="flex items-center gap-2 text-white">
                    <Accordion.Trigger aria-label={`${index + 1}번 문항 접기 또는 펼치기`} />
                    <h2>
                      <Accordion.Label>문항 {index + 1}</Accordion.Label>
                    </h2>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-white">{question.question ?? ''}</p>
                </Accordion.Header>
                <Accordion.Content>
                  <CoverLetterContentSection title="내가 쓴 자기소개서">
                    {question.originalAnswer ?? ''}
                  </CoverLetterContentSection>
                  <CoverLetterContentSection title="AI 리포트">
                    {question.aiReport ?? ''}
                  </CoverLetterContentSection>
                  <CoverLetterDiff
                    original={question.originalAnswer ?? ''}
                    reviewed={question.rewrittenAnswer ?? ''}
                  />
                  <TextArea id={`result-${question.questionId}`}>
                    <TextArea.Label>최종 작성본</TextArea.Label>
                    {question.maxAnswerLength === null ? (
                      <TextArea.Field
                        readOnly
                        showCount
                        value={question.finalAnswer ?? question.rewrittenAnswer ?? ''}
                      />
                    ) : (
                      <TextArea.Field
                        readOnly
                        showCount
                        recommendedLength={question.maxAnswerLength}
                        value={question.finalAnswer ?? question.rewrittenAnswer ?? ''}
                      />
                    )}
                  </TextArea>
                </Accordion.Content>
              </Accordion>
            </article>
          ))}
      </div>
    </section>
  );
}
