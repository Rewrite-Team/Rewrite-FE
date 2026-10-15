import { CoverLetterDiff, type QuestionResponse } from '@/entities/cover-letter';
import { Accordion } from '@/shared/ui/accordion';
import { TextArea } from '@/shared/ui/textarea';

import { CoverLetterContentSection } from './CoverLetterContentSection';

interface CoverLetterReviewQuestionProps {
  question: QuestionResponse;
  questionNumber: number;
}

/** 완료된 문항의 원문, AI 리포트, 첨삭 결과와 최종 작성본을 표시합니다. */
export function CoverLetterReviewQuestion({
  question,
  questionNumber,
}: CoverLetterReviewQuestionProps) {
  return (
    <article>
      <Accordion defaultOpen className="rounded-2xl p-6">
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label={`${questionNumber}번 문항 접기 또는 펼치기`} />
            <h2>
              <Accordion.Label>문항 {questionNumber}</Accordion.Label>
            </h2>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-white">{question.question ?? ''}</p>
        </Accordion.Header>
        <Accordion.Content>
          <CoverLetterContentSection title="내가 쓴 자기소개서">
            {question.originalAnswer ?? ''}
          </CoverLetterContentSection>
          <CoverLetterContentSection title="AI 리포트">
            {question.aiReport ?? ''}
          </CoverLetterContentSection>
          <CoverLetterDiff
            original={question.originalAnswer ?? ''}
            reviewed={question.rewrittenAnswer ?? ''}
          />
          <TextArea id={`result-${question.questionId}`}>
            <TextArea.Label>최종 작성본</TextArea.Label>
            {question.maxAnswerLength === null ? (
              <TextArea.Field
                readOnly
                showCount
                value={question.finalAnswer ?? question.rewrittenAnswer ?? ''}
              />
            ) : (
              <TextArea.Field
                readOnly
                showCount
                recommendedLength={question.maxAnswerLength}
                value={question.finalAnswer ?? question.rewrittenAnswer ?? ''}
              />
            )}
          </TextArea>
        </Accordion.Content>
      </Accordion>
    </article>
  );
}
