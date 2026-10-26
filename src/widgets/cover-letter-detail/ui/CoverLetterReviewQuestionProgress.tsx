import { CoverLetterDiff, type QuestionResponse } from '@/entities/cover-letter';
import type { ReviewQuestionSnapshot } from '@/entities/llm-job';

import { CoverLetterContentSection } from './CoverLetterContentSection';
import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';
import {
  CoverLetterReviewContentSkeleton,
  CoverLetterReviewDiffSkeleton,
} from './CoverLetterReviewSkeleton';

interface CoverLetterReviewQuestionProgressProps {
  question: QuestionResponse;
  questionNumber: number;
  result?: ReviewQuestionSnapshot;
}

/** 문항별 원문, 첨삭 결과와 아직 도착하지 않은 결과의 스켈레톤을 표시합니다. */
export function CoverLetterReviewQuestionProgress({
  question,
  questionNumber,
  result,
}: CoverLetterReviewQuestionProgressProps) {
  const hasAiReport = result?.aiReport != null;
  const hasRewrittenAnswer = result?.rewrittenAnswer != null;
  const hasFinalAnswer = result?.finalAnswer != null;

  return (
    <CoverLetterQuestionCard question={question} questionNumber={questionNumber}>
      {!hasAiReport || !hasRewrittenAnswer || !hasFinalAnswer ? (
        <span className="sr-only" role="status">
          문항 {questionNumber}의 AI 첨삭 결과를 생성하고 있어요.
        </span>
      ) : null}
      {hasAiReport ? (
        <CoverLetterContentSection title="AI 리포트">{result.aiReport}</CoverLetterContentSection>
      ) : (
        <CoverLetterReviewContentSkeleton title="AI 리포트" />
      )}
      {hasRewrittenAnswer ? (
        <CoverLetterDiff
          original={question.originalAnswer ?? ''}
          reviewed={result?.rewrittenAnswer ?? ''}
        />
      ) : (
        <CoverLetterReviewDiffSkeleton />
      )}
      {hasFinalAnswer ? (
        <CoverLetterContentSection title="최종 작성본">
          {result.finalAnswer}
        </CoverLetterContentSection>
      ) : (
        <CoverLetterReviewContentSkeleton title="최종 작성본" />
      )}
    </CoverLetterQuestionCard>
  );
}
