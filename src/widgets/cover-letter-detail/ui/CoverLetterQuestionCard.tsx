'use client';

import { CoverLetterDiff, type CoverLetterQuestionDetail } from '@/entities/cover-letter';
import { Accordion } from '@/shared/ui/accordion';

import { CoverLetterContentSection } from './CoverLetterContentSection';
import { FinalDraftSection } from './FinalDraftSection';

interface CoverLetterQuestionCardProps {
  onFinalDraftDirtyChange?: (questionId: string, isDirty: boolean) => void;
  onFinalDraftSave?: (questionId: string, value: string) => void;
  question: CoverLetterQuestionDetail;
  questionNumber: number;
  readOnly?: boolean;
}

/** 질문, 원문, AI 첨삭 결과와 최종 작성본을 하나의 접이식 문항 카드로 표시합니다. */
export function CoverLetterQuestionCard({
  onFinalDraftDirtyChange,
  onFinalDraftSave,
  question,
  questionNumber,
  readOnly = false,
}: CoverLetterQuestionCardProps) {
  const headingId = `cover-letter-question-${question.id}`;

  return (
    <article aria-labelledby={headingId}>
      <Accordion className="rounded-2xl" defaultOpen>
        <Accordion.Header>
          <div className="flex items-center gap-1">
            <Accordion.Trigger
              aria-label={`${questionNumber}번 자기소개서 문항 접기 또는 펼치기`}
            />
            <h2 className="m-0 text-white" id={headingId}>
              <Accordion.Label>질문 {questionNumber}</Accordion.Label>
            </h2>
          </div>
          <p className="mt-3 mb-0 rounded-lg bg-gray-600 px-5 py-5 wrap-break-word body-16 text-white">
            {question.question}
          </p>
        </Accordion.Header>

        <Accordion.Content>
          <CoverLetterContentSection
            characterCount={{
              current: question.originalAnswer.length,
              limit: question.characterLimit,
            }}
            title="내가 쓴 자기소개서"
          >
            {question.originalAnswer}
          </CoverLetterContentSection>

          <CoverLetterContentSection title="AI 리포트">
            {question.aiReport}
          </CoverLetterContentSection>

          <CoverLetterDiff original={question.originalAnswer} reviewed={question.reviewedAnswer} />

          <FinalDraftSection
            characterLimit={question.characterLimit}
            initialValue={question.finalAnswer}
            onDraftDirtyChange={(isDirty) => onFinalDraftDirtyChange?.(question.id, isDirty)}
            onSave={(value) => onFinalDraftSave?.(question.id, value)}
            questionId={question.id}
            readOnly={readOnly}
          />
        </Accordion.Content>
      </Accordion>
    </article>
  );
}
