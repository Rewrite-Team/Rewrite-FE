import type { QuestionResponse } from '@/entities/cover-letter';
import type { LlmJobStateResponse, ReviewQuestionSnapshot } from '@/entities/llm-job';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterReviewQuestionProgress } from './CoverLetterReviewQuestionProgress';
import { CoverLetterReviewStatusCard } from './CoverLetterReviewStatusCard';

interface CoverLetterReviewProgressProps {
  title: string;
  progress?: LlmJobStateResponse['progress'];
  questions: QuestionResponse[];
  questionResults: ReviewQuestionSnapshot[];
  hasJobId: boolean;
  isCompleted: boolean;
  connectionIssue?: string;
  isFetching: boolean;
  onRefresh: () => void;
}

/** 첨삭 진행률, 연결 안내와 도착한 문항 결과를 표시합니다. */
export function CoverLetterReviewProgress({
  title,
  progress,
  questions,
  questionResults,
  hasJobId,
  isCompleted,
  connectionIssue,
  isFetching,
  onRefresh,
}: CoverLetterReviewProgressProps) {
  const resultsByQuestionId = new Map(questionResults.map((result) => [result.questionId, result]));
  return (
    <section className="writing-detail-content">
      <PageHeader
        title={title}
        description="문항별 진행 상황과 도착한 첨삭 결과를 확인할 수 있어요."
      />
      <CoverLetterReviewStatusCard
        progress={progress}
        questionCount={questions.length}
        receivedResultCount={questionResults.length}
        hasJobId={hasJobId}
        isCompleted={isCompleted}
        connectionIssue={connectionIssue}
        isFetching={isFetching}
        onRefresh={onRefresh}
      />
      <div className="mt-8 flex flex-col gap-6">
        {[...questions]
          .sort((first, second) => first.order - second.order)
          .map((question, index) => {
            return (
              <CoverLetterReviewQuestionProgress
                key={question.questionId}
                question={question}
                questionNumber={index + 1}
                result={resultsByQuestionId.get(question.questionId)}
              />
            );
          })}
      </div>
    </section>
  );
}
