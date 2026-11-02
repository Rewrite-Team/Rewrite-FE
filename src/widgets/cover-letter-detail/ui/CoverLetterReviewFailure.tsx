import { useRef, useState } from 'react';

import { getCoverLetterQuestionDomId, type QuestionResponse } from '@/entities/cover-letter';
import type { LlmJobStateResponse, ReviewQuestionSnapshot } from '@/entities/llm-job';
import { ROUTES } from '@/shared/constants/routes';
import { getPreferredScrollBehavior, prefersReducedMotion } from '@/shared/lib/motionPreferences';
import { scrollWindowToTop } from '@/shared/lib/scrollWindowToTop';
import { LinkButton } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/state-feedback';

import { CoverLetterPageHeader } from './CoverLetterPageHeader';
import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';
import { CoverLetterReviewQuestion } from './CoverLetterReviewQuestion';
import { CoverLetterReviewStatusCard } from './CoverLetterReviewStatusCard';
import {
  REVIEW_FAILURE_USER_MESSAGE,
  REVIEW_QUESTION_FAILURE_USER_MESSAGE,
} from '../model/reviewJobMessages';

interface CoverLetterReviewFailureProps {
  companyName?: string | null;
  jobPostingUrl?: string | null;
  isFetching: boolean;
  onRefresh: () => void;
  questions: QuestionResponse[];
  questionResults: ReviewQuestionSnapshot[];
  progress?: LlmJobStateResponse['progress'];
  positionTitle?: string | null;
  title: string;
}

/** 전체 실패는 공통 오류를, 부분 실패는 완료 결과와 실패 문항을 함께 표시합니다. */
export function CoverLetterReviewFailure({
  companyName,
  jobPostingUrl,
  isFetching,
  onRefresh,
  questions,
  questionResults,
  progress,
  positionTitle,
  title,
}: CoverLetterReviewFailureProps) {
  const resultsByQuestionId = new Map(questionResults.map((result) => [result.questionId, result]));
  const [openFailedQuestions, setOpenFailedQuestions] = useState<Record<string, boolean>>({});
  const pendingScrollQuestionId = useRef<string | null>(null);
  const questionEntries = [...questions]
    .sort((first, second) => first.order - second.order)
    .map((question, index) => {
      const questionNumber = index + 1;
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

      return { hasResult, question: resolvedQuestion, questionNumber };
    });
  const failedQuestionNumbers = questionEntries
    .filter(({ hasResult }) => !hasResult)
    .map(({ questionNumber }) => questionNumber);
  const hasAnyResult = questionEntries.some(({ hasResult }) => hasResult);
  const hasPartialFailure = hasAnyResult && failedQuestionNumbers.length > 0;

  const scrollToQuestion = (questionNumber: number) => {
    document
      .getElementById(getCoverLetterQuestionDomId(questionNumber))
      ?.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
  };

  const handleFailedQuestionClick = (questionNumber: number) => {
    const failedQuestion = questionEntries.find(
      (entry) => entry.questionNumber === questionNumber && !entry.hasResult
    );
    if (!failedQuestion) return;

    const questionId = failedQuestion.question.questionId;
    const isAlreadyOpen = openFailedQuestions[questionId] ?? true;
    pendingScrollQuestionId.current = null;
    setOpenFailedQuestions((previous) => ({ ...previous, [questionId]: true }));

    if (isAlreadyOpen || prefersReducedMotion()) {
      window.requestAnimationFrame(() => scrollToQuestion(questionNumber));
      return;
    }

    pendingScrollQuestionId.current = questionId;
  };

  const statusCardProps = hasPartialFailure
    ? {
        status: 'partial-failure' as const,
        failedQuestionNumbers,
        onFailedQuestionClick: handleFailedQuestionClick,
      }
    : { status: 'failed' as const };

  return (
    <section className="writing-detail-content">
      <CoverLetterPageHeader
        companyName={companyName}
        jobPostingUrl={jobPostingUrl}
        positionTitle={positionTitle}
        title={title}
      />
      <CoverLetterReviewStatusCard
        progress={progress}
        questionCount={questions.length}
        {...statusCardProps}
        errorMessage={REVIEW_FAILURE_USER_MESSAGE}
        isFetching={isFetching}
        onRefresh={onRefresh}
      />
      {hasAnyResult ? (
        <div className="mt-8 flex flex-col gap-6">
          {questionEntries.map(({ hasResult, question, questionNumber }) => {
            if (!hasResult) {
              // TODO: 재시도 API가 준비되면 questionId를 전달하고 요청 중인 문항만 로딩·비활성화한다.
              return (
                <article
                  id={getCoverLetterQuestionDomId(questionNumber)}
                  key={question.questionId}
                  className="scroll-mt-24"
                >
                  <CoverLetterQuestionCard
                    hasError
                    open={openFailedQuestions[question.questionId] ?? true}
                    onOpenTransitionEnd={() => {
                      if (pendingScrollQuestionId.current !== question.questionId) return;

                      scrollToQuestion(questionNumber);
                      pendingScrollQuestionId.current = null;
                    }}
                    onOpenChange={(open) => {
                      setOpenFailedQuestions((previous) => ({
                        ...previous,
                        [question.questionId]: open,
                      }));

                      if (!open && pendingScrollQuestionId.current === question.questionId) {
                        pendingScrollQuestionId.current = null;
                      }
                    }}
                    question={question}
                    questionNumber={questionNumber}
                  >
                    <ErrorState
                      animationData={null}
                      className="mx-auto"
                      title={`문항 ${questionNumber} 첨삭에 실패했어요`}
                      description={REVIEW_QUESTION_FAILURE_USER_MESSAGE}
                    />
                  </CoverLetterQuestionCard>
                </article>
              );
            }

            return (
              <CoverLetterReviewQuestion
                key={question.questionId}
                question={question}
                questionNumber={questionNumber}
              />
            );
          })}
        </div>
      ) : null}
      <LinkButton
        className="mt-8 w-full"
        href={ROUTES.WRITING}
        onClick={scrollWindowToTop}
        variant="outline"
      >
        목록으로 이동
      </LinkButton>
    </section>
  );
}
