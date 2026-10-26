import { getCoverLetterQuestionDomId } from '@/entities/cover-letter';
import type { LlmJobStateResponse } from '@/entities/llm-job';
import { AlertCircleIcon, CheckMarkIcon } from '@/shared/assets/icons/common';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import {
  COVER_LETTER_REVIEW_PROGRESS_MAX_PERCENTAGE,
  getCoverLetterReviewProgressSummary,
} from '../model/getCoverLetterReviewProgressSummary';

interface CoverLetterReviewStatusCardBaseProps {
  progress?: LlmJobStateResponse['progress'];
  questionCount: number;
  isFetching: boolean;
  onRefresh: () => void;
}

type CoverLetterReviewStatusCardProps = CoverLetterReviewStatusCardBaseProps &
  (
    | { status: 'processing'; hasJobId: boolean; connectionIssue?: string }
    | { status: 'completed' }
    | { status: 'failed'; errorMessage?: string }
    | {
        status: 'partial-failure';
        failedQuestionNumbers: number[];
        onFailedQuestionClick: (questionNumber: number) => void;
        errorMessage?: string;
      }
  );

/** 첨삭 진행, 완료, 실패와 연결 상태를 같은 카드 형태로 표시합니다. */
export function CoverLetterReviewStatusCard(props: CoverLetterReviewStatusCardProps) {
  const { progress, questionCount, isFetching, onRefresh, status } = props;
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed' || status === 'partial-failure';
  const isPartialFailure = status === 'partial-failure';
  const errorMessage = isFailed ? props.errorMessage : undefined;
  const failedQuestionNumbers = isPartialFailure ? props.failedQuestionNumbers : [];
  const onFailedQuestionClick = isPartialFailure ? props.onFailedQuestionClick : undefined;
  const connectionIssue = status === 'processing' ? props.connectionIssue : undefined;
  const hasJobId = status === 'processing' ? props.hasJobId : true;
  const progressSummary = getCoverLetterReviewProgressSummary({
    isCompleted,
    progress,
    questionCount,
  });

  return (
    <div
      className={`mt-8 rounded-3xl border p-5 shadow-sm sm:p-7 ${isFailed ? 'border-error-500/30 bg-gray-800' : isCompleted ? 'border-primary-500/30 bg-gray-800' : 'border-gray-700 bg-gray-800'}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isFailed ? 'bg-error-500/10 text-error-500' : isCompleted ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-300'}`}
        >
          {isFailed ? (
            <AlertCircleIcon aria-hidden="true" className="size-6" />
          ) : isCompleted ? (
            <CheckMarkIcon aria-hidden="true" className="size-6" />
          ) : (
            <Spinner className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 body-18 font-semibold text-white">
            {isFailed
              ? isPartialFailure
                ? '일부 문항에서 첨삭 오류가 발생했어요'
                : 'AI 첨삭이 중단됐어요'
              : isCompleted
                ? 'AI 첨삭이 완료됐어요'
                : 'AI가 문항을 첨삭하고 있어요'}
          </h2>
          <p role={isFailed ? 'alert' : 'status'} className="mt-1 mb-0 body-14 text-gray-100">
            {isFailed
              ? errorMessage || '첨삭 결과를 불러오지 못했습니다.'
              : isCompleted
                ? '문항별 결과를 확인할 수 있어요.'
                : progress?.message || '첨삭을 준비하고 있습니다.'}
          </p>
        </div>
        {!isFailed && progressSummary.percentage !== undefined ? (
          <p className="m-0 shrink-0 rounded-full bg-gray-700 px-3 py-1 body-14 font-semibold text-primary-300">
            {progressSummary.percentage}%
          </p>
        ) : null}
        {isFailed ? (
          <Button
            className="h-10 w-full min-w-32 shrink-0 px-4 sm:w-auto"
            onClick={onRefresh}
            isLoading={isFetching}
            size="sm"
          >
            실패한 문항 결과 다시 불러오기
          </Button>
        ) : null}
      </div>
      {!isFailed ? (
        <>
          <div
            aria-label="AI 첨삭 진행률"
            aria-valuemax={COVER_LETTER_REVIEW_PROGRESS_MAX_PERCENTAGE}
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
          <div className="mt-3 flex items-center justify-between gap-3 body-14 text-gray-100">
            <span>{isCompleted ? '작업 완료' : '진행된 문항'}</span>
            <span className="font-medium text-white">
              {progressSummary.processedQuestions ?? '확인 중'} / {progressSummary.totalQuestions}{' '}
              문항
            </span>
          </div>
        </>
      ) : isPartialFailure ? (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-gray-900/70 px-4 py-3 body-14">
          <span className="text-gray-100">실패한 문항</span>
          <div className="flex flex-wrap justify-end gap-2">
            {failedQuestionNumbers.map((questionNumber) => (
              <a
                key={questionNumber}
                className="font-semibold text-error-400 underline-offset-4 hover:text-error-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-400"
                href={`#${getCoverLetterQuestionDomId(questionNumber)}`}
                onClick={(event) => {
                  event.preventDefault();
                  onFailedQuestionClick?.(questionNumber);
                }}
              >
                {questionNumber}번
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {!isFailed && (!hasJobId || connectionIssue) ? (
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
            진행 상황 다시 확인
          </Button>
        </div>
      ) : null}
    </div>
  );
}
