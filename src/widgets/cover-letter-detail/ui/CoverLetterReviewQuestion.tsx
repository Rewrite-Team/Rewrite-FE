import { useState, type ChangeEvent } from 'react';

import { CoverLetterDiff, type QuestionResponse } from '@/entities/cover-letter';
import { EditIcon } from '@/shared/assets/icons/common';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { Button } from '@/shared/ui/button';
import { TextArea } from '@/shared/ui/textarea';

import { CoverLetterContentSection } from './CoverLetterContentSection';
import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';

interface CoverLetterReviewQuestionProps {
  finalAnswer?: string;
  isEditable?: boolean;
  onAnswerCommit?: (questionId: string, nextAnswer: string) => void;
  onDraftChange?: (questionId: string, draftAnswer: string | null) => void;
  question: QuestionResponse;
  questionNumber: number;
}

/** 완료된 문항의 원문, AI 리포트, 첨삭 결과와 최종 작성본을 표시합니다. */
export function CoverLetterReviewQuestion({
  finalAnswer: finalAnswerProp,
  isEditable = false,
  onAnswerCommit,
  onDraftChange,
  question,
  questionNumber,
}: CoverLetterReviewQuestionProps) {
  const finalAnswer = finalAnswerProp ?? question.finalAnswer ?? question.rewrittenAnswer ?? '';
  const [isEditing, setIsEditing] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState(finalAnswer);

  const handleEdit = () => {
    setDraftAnswer(finalAnswer);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftAnswer(finalAnswer);
    setIsEditing(false);
    onDraftChange?.(question.questionId, null);
  };

  const handleSave = () => {
    onAnswerCommit?.(question.questionId, draftAnswer);
    setIsEditing(false);
    onDraftChange?.(question.questionId, null);
  };

  const handleAnswerChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextAnswer = event.currentTarget.value.slice(0, INPUT_LIMITS.COVER_LETTER_ANSWER);
    setDraftAnswer(nextAnswer);
    onDraftChange?.(question.questionId, nextAnswer === finalAnswer ? null : nextAnswer);
  };

  return (
    <article>
      <CoverLetterQuestionCard question={question} questionNumber={questionNumber}>
        <CoverLetterContentSection title="AI 리포트">
          {question.aiReport ?? ''}
        </CoverLetterContentSection>
        <CoverLetterDiff
          original={question.originalAnswer ?? ''}
          reviewed={question.rewrittenAnswer ?? ''}
        />
        <section aria-label="최종 작성본" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="body-18 font-semibold text-white">최종 작성본</h3>
              <p className="mt-1 text-gray-100 body-14">
                첨삭 내용을 참고하여 최종 작성본을 완성해 보세요. 문항별 적용 후 하단에서 저장할 수
                있어요.
              </p>
            </div>
            {isEditing && isEditable ? (
              <div className="flex shrink-0 items-center gap-2">
                <Button onClick={handleCancel} size="sm" variant="secondary">
                  취소
                </Button>
                <Button disabled={!draftAnswer.trim()} onClick={handleSave} size="sm">
                  적용
                </Button>
              </div>
            ) : isEditable ? (
              <Button
                aria-label={`${questionNumber}번 최종 작성본 편집`}
                iconOnly
                onClick={handleEdit}
                variant="ghost"
              >
                <EditIcon aria-hidden="true" className="size-5" />
              </Button>
            ) : null}
          </div>
          <TextArea id={`result-${question.questionId}`}>
            <TextArea.Label className="sr-only">최종 작성본</TextArea.Label>
            {isEditing && isEditable ? (
              <TextArea.Field
                onChange={handleAnswerChange}
                recommendedLength={question.maxAnswerLength ?? INPUT_LIMITS.COVER_LETTER_ANSWER}
                showCount
                value={draftAnswer}
              />
            ) : question.maxAnswerLength === null ? (
              <TextArea.Field readOnly showCount value={finalAnswer} />
            ) : (
              <TextArea.Field
                readOnly
                recommendedLength={question.maxAnswerLength}
                showCount
                value={finalAnswer}
              />
            )}
          </TextArea>
        </section>
      </CoverLetterQuestionCard>
    </article>
  );
}
