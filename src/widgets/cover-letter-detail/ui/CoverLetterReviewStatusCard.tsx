import type { LlmJobStateResponse } from '@/entities/llm-job';
import { AlertCircleIcon, CheckMarkIcon } from '@/shared/assets/icons/common';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import { getCoverLetterReviewProgressSummary } from '../model/getCoverLetterReviewProgressSummary';

interface CoverLetterReviewStatusCardProps {
  progress?: LlmJobStateResponse['progress'];
  questionCount: number;
  receivedResultCount: number;
  hasJobId: boolean;
  isCompleted: boolean;
  connectionIssue?: string;
  isFetching: boolean;
  onRefresh: () => void;
}

/** 첨삭 Job 진행률, 결과 수신 현황과 연결 오류를 표시합니다. */
export function CoverLetterReviewStatusCard({
  progress,
  questionCount,
  receivedResultCount,
  hasJobId,
  isCompleted,
  connectionIssue,
  isFetching,
  onRefresh,
}: CoverLetterReviewStatusCardProps) {
  const progressSummary = getCoverLetterReviewProgressSummary({
    isCompleted,
    progress,
    questionCount,
    receivedResultCount,
  });

  return (
    <div
      className={`mt-8 rounded-3xl border p-5 shadow-sm sm:p-7 ${isCompleted ? 'border-primary-500/30 bg-gray-800' : 'border-gray-700 bg-gray-800'}`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isCompleted ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-300'}`}
        >
          {isCompleted ? (
            <CheckMarkIcon aria-hidden="true" className="size-6" />
          ) : (
            <Spinner className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 body-18 font-semibold text-white">
            {isCompleted ? 'AI 첨삭이 완료됐어요' : 'AI가 문항을 첨삭하고 있어요'}
          </h2>
          <p role="status" className="mt-1 mb-0 body-14 text-gray-100">
            {isCompleted
              ? '문항별 결과를 확인할 수 있어요.'
              : progress?.message || '첨삭을 준비하고 있습니다.'}
          </p>
        </div>
        {progressSummary.percentage !== undefined ? (
          <p className="m-0 shrink-0 rounded-full bg-gray-700 px-3 py-1 body-14 font-semibold text-primary-300">
            {progressSummary.percentage}%
          </p>
        ) : null}
      </div>
      <div
        aria-label="AI 첨삭 진행률"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressSummary.percentage}
        className="mt-6 h-2.5 overflow-hidden rounded-full bg-gray-700"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full bg-primary-500 transition-[width] duration-500 ${progressSummary.percentage === undefined ? 'w-1/3 animate-pulse' : ''}`}
          style={
            progressSummary.percentage === undefined
              ? undefined
              : { width: `${progressSummary.percentage}%` }
          }
        />
      </div>
      <div className="mt-3 flex flex-col gap-2 body-14 text-gray-100">
        <div className="flex items-center justify-between gap-3">
          <span>{isCompleted ? '작업 완료' : '작업 진행'}</span>
          <span className="font-medium text-white">
            {progressSummary.processedQuestions ?? '확인 중'} / {progressSummary.totalQuestions}{' '}
            문항
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>결과 도착</span>
          <span className="font-medium text-white">
            {progressSummary.receivedResults} / {progressSummary.resultQuestionCount} 문항
          </span>
        </div>
      </div>
      {!hasJobId || connectionIssue ? (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-error-500/20 bg-gray-900/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3" role="alert">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error-500/10 text-error-500">
              <AlertCircleIcon aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="m-0 body-14 font-semibold text-white">첨삭 상태를 확인하지 못했어요</p>
              <p className="mt-1 mb-0 wrap-break-word body-14 text-gray-100">
                {connectionIssue ?? '첨삭 작업 정보를 확인하지 못했습니다.'}
              </p>
            </div>
          </div>
          <Button
            className="h-10 w-full min-w-32 px-4 sm:w-auto"
            onClick={onRefresh}
            isLoading={isFetching}
            size="sm"
          >
            상태 새로고침
          </Button>
        </div>
      ) : null}
    </div>
  );
}
