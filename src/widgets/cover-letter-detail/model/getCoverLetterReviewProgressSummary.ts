import type { LlmJobStateResponse } from '@/entities/llm-job';

export const COVER_LETTER_REVIEW_PROGRESS_MAX_PERCENTAGE = 100;

interface GetCoverLetterReviewProgressSummaryParams {
  isCompleted: boolean;
  progress?: LlmJobStateResponse['progress'];
  questionCount: number;
}

/** Job 진행 정보와 문항 수를 바탕으로 처리 문항 수와 진행률을 계산합니다. */
export const getCoverLetterReviewProgressSummary = ({
  isCompleted,
  progress,
  questionCount,
}: GetCoverLetterReviewProgressSummaryParams) => {
  const totalQuestions = progress?.total || questionCount;
  const processedQuestions = isCompleted
    ? totalQuestions
    : progress
      ? Math.min(progress.current, totalQuestions)
      : undefined;
  const percentage = isCompleted
    ? COVER_LETTER_REVIEW_PROGRESS_MAX_PERCENTAGE
    : processedQuestions !== undefined && totalQuestions > 0
      ? Math.round(
          (processedQuestions / totalQuestions) * COVER_LETTER_REVIEW_PROGRESS_MAX_PERCENTAGE
        )
      : undefined;

  return {
    percentage,
    processedQuestions,
    totalQuestions,
  };
};
