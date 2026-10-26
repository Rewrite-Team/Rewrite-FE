import type { LlmJobStateResponse } from '@/entities/llm-job';

interface GetCoverLetterReviewProgressSummaryParams {
  isCompleted: boolean;
  progress?: LlmJobStateResponse['progress'];
  questionCount: number;
  receivedResultCount: number;
}

/** Job 처리 진행률과 SSE 결과 수신 수를 서로 다른 기준으로 계산합니다. */
export const getCoverLetterReviewProgressSummary = ({
  isCompleted,
  progress,
  questionCount,
  receivedResultCount,
}: GetCoverLetterReviewProgressSummaryParams) => {
  const totalQuestions = progress?.total || questionCount;
  const processedQuestions = isCompleted
    ? totalQuestions
    : progress
      ? Math.min(progress.current, totalQuestions)
      : undefined;
  const percentage = isCompleted
    ? 100
    : processedQuestions !== undefined && totalQuestions > 0
      ? Math.round((processedQuestions / totalQuestions) * 100)
      : undefined;

  return {
    percentage,
    processedQuestions,
    receivedResults: Math.min(receivedResultCount, questionCount),
    resultQuestionCount: questionCount,
    totalQuestions,
  };
};
