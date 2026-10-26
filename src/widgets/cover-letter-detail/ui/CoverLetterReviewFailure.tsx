import type { QuestionResponse } from '@/entities/cover-letter';
import type { ReviewQuestionSnapshot } from '@/entities/llm-job';
import { ROUTES } from '@/shared/constants/routes';
import { Button, LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';
import { CoverLetterReviewQuestion } from './CoverLetterReviewQuestion';

interface CoverLetterReviewFailureProps {
  errorMessage: string;
  isFetching: boolean;
  onRefresh: () => void;
  questions: QuestionResponse[];
  questionResults: ReviewQuestionSnapshot[];
  title: string;
}

/** 전체 실패는 공통 오류만 표시하고, 부분 실패는 결과가 없는 문항만 실패로 표시합니다. */
export function CoverLetterReviewFailure({
  errorMessage,
  isFetching,
  onRefresh,
  questions,
  questionResults,
  title,
}: CoverLetterReviewFailureProps) {
  const resultsByQuestionId = new Map(questionResults.map((result) => [result.questionId, result]));
  const questionsWithResults = [...questions]
    .sort((first, second) => first.order - second.order)
    .map((question) => {
      const result = resultsByQuestionId.get(question.questionId);
      const hasResult = Boolean(
        result || question.aiReport || question.rewrittenAnswer || question.finalAnswer
      );
      const resolvedQuestion: QuestionResponse = result
        ? {
            ...question,
            aiReport: result.aiReport ?? question.aiReport,
            rewrittenAnswer: result.rewrittenAnswer ?? question.rewrittenAnswer,
            finalAnswer: result.finalAnswer ?? question.finalAnswer,
          }
        : question;

      return { hasResult, question: resolvedQuestion };
    });
  const hasAnyResult = questionsWithResults.some(({ hasResult }) => hasResult);
  const hasPartialFailure =
    hasAnyResult && questionsWithResults.some(({ hasResult }) => !hasResult);

  return (
    <section className="writing-detail-content">
      <PageHeader
        title={title}
        description={
          hasPartialFailure
            ? '일부 문항의 AI 첨삭을 완료하지 못했어요.'
            : 'AI 첨삭 작업을 완료하지 못했어요.'
        }
      />
      {!hasPartialFailure ? (
        <div className="mt-6 rounded-2xl bg-gray-800 p-6">
          <p role="alert" className="body-16 text-white">
            {errorMessage}
          </p>
          <Button className="mt-4" isLoading={isFetching} onClick={onRefresh} variant="outline">
            상태 새로고침
          </Button>
        </div>
      ) : null}
      {hasAnyResult ? (
        <div className="mt-8 flex flex-col gap-6">
          {questionsWithResults.map(({ hasResult, question }, index) => {
            if (!hasResult) {
              return (
                <article key={question.questionId}>
                  <CoverLetterQuestionCard question={question} questionNumber={index + 1}>
                    <ErrorState
                      animationData={null}
                      className="mx-auto"
                      title={`문항 ${index + 1} 첨삭에 실패했어요`}
                      description={errorMessage}
                      retry={{
                        label: '상태 새로고침',
                        onClick: onRefresh,
                        isLoading: isFetching,
                      }}
                    />
                  </CoverLetterQuestionCard>
                </article>
              );
            }

            return (
              <CoverLetterReviewQuestion
                key={question.questionId}
                question={question}
                questionNumber={index + 1}
              />
            );
          })}
        </div>
      ) : null}
      <LinkButton className="mt-8 self-start" href={ROUTES.WRITING} variant="outline">
        목록으로 이동
      </LinkButton>
    </section>
  );
}
