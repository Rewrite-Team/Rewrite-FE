import type { ReactNode } from 'react';

import type { QuestionResponse } from '@/entities/cover-letter';
import { cn } from '@/shared/styles/utils/cn';
import { Accordion } from '@/shared/ui/accordion';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';

interface CoverLetterQuestionCardProps {
  children?: ReactNode;
  hasError?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenTransitionEnd?: () => void;
  question: QuestionResponse;
  questionNumber: number;
}

/** 상세 화면에서 질문과 원문 답변을 접고 펼쳐 확인하는 공통 카드입니다. */
export function CoverLetterQuestionCard({
  children,
  hasError = false,
  open,
  onOpenChange,
  onOpenTransitionEnd,
  question,
  questionNumber,
}: CoverLetterQuestionCardProps) {
  const originalAnswer = question.originalAnswer ?? '';

  return (
    <Accordion
      defaultOpen={open ?? true}
      onOpenChange={onOpenChange}
      open={open}
      className={cn(
        'rounded-2xl',
        hasError &&
          'border-2 border-error-500/70 shadow-[0_0_20px_color-mix(in_srgb,var(--color-error-500)_45%,transparent)]'
      )}
    >
      <Accordion.Header>
        <Input id={`detail-question-${question.questionId}`}>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger
              aria-label={`${questionNumber}번 자기소개서 문항 접기 또는 펼치기`}
            />
            <Accordion.Label asChild>
              <Input.Label>문항 {questionNumber}</Input.Label>
            </Accordion.Label>
          </div>
          <div className="pt-3">
            <Input.Field readOnly value={question.question ?? ''} />
          </div>
        </Input>
      </Accordion.Header>
      <Accordion.Content
        unmountOnClose
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && open) {
            onOpenTransitionEnd?.();
          }
        }}
      >
        <TextArea id={`detail-original-answer-${question.questionId}`}>
          <TextArea.Label>내가 쓴 자기소개서</TextArea.Label>
          {question.maxAnswerLength === null ? (
            <TextArea.Field readOnly showCount value={originalAnswer} />
          ) : (
            <TextArea.Field
              readOnly
              recommendedLength={question.maxAnswerLength}
              showCount
              value={originalAnswer}
            />
          )}
        </TextArea>
        {children}
      </Accordion.Content>
    </Accordion>
  );
}
