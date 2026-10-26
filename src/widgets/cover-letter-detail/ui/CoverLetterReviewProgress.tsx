import type { QuestionResponse } from '@/entities/cover-letter';
import type { LlmJobStateResponse, ReviewQuestionSnapshot } from '@/entities/llm-job';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterContentSection } from './CoverLetterContentSection';
import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';

interface CoverLetterReviewProgressProps {
  title: string;
  progress?: LlmJobStateResponse['progress'];
  questions: QuestionResponse[];
  questionResults: ReviewQuestionSnapshot[];
  hasJobId: boolean;
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
  connectionIssue,
  isFetching,
  onRefresh,
}: CoverLetterReviewProgressProps) {
  const resultsByQuestionId = new Map(questionResults.map((result) => [result.questionId, result]));

  return (
    <section className="writing-detail-content">
      <PageHeader title={title} description="AI가 자기소개서를 첨삭하고 있습니다." />
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
        {!hasJobId || connectionIssue ? (
          <div className="mt-4">
            <p role="alert" className="text-error-500">
              {connectionIssue ?? '첨삭 작업 정보를 확인하지 못했습니다.'}
            </p>
            <Button className="mt-3" onClick={onRefresh} isLoading={isFetching}>
              상태 새로고침
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-8 flex flex-col gap-6">
        {[...questions]
          .sort((first, second) => first.order - second.order)
          .map((question, index) => {
            const result = resultsByQuestionId.get(question.questionId);

            return (
              <CoverLetterQuestionCard
                key={question.questionId}
                question={question}
                questionNumber={index + 1}
              >
                {result?.aiReport != null ? (
                  <CoverLetterContentSection title="AI 리포트">
                    {result.aiReport}
                  </CoverLetterContentSection>
                ) : null}
                {result?.rewrittenAnswer != null ? (
                  <CoverLetterContentSection title="AI 첨삭 결과">
                    {result.rewrittenAnswer}
                  </CoverLetterContentSection>
                ) : null}
                {result?.finalAnswer != null ? (
                  <CoverLetterContentSection title="최종 작성본">
                    {result.finalAnswer}
                  </CoverLetterContentSection>
                ) : null}
              </CoverLetterQuestionCard>
            );
          })}
      </div>
    </section>
  );
}
