import type { ReactNode } from 'react';

import type { QuestionResponse } from '@/entities/cover-letter';
import { Accordion } from '@/shared/ui/accordion';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';

interface CoverLetterQuestionCardProps {
  children?: ReactNode;
  question: QuestionResponse;
  questionNumber: number;
}

/** 상세 화면에서 질문과 원문 답변을 접고 펼쳐 확인하는 공통 카드입니다. */
export function CoverLetterQuestionCard({
  children,
  question,
  questionNumber,
}: CoverLetterQuestionCardProps) {
  const originalAnswer = question.originalAnswer ?? '';

  return (
    <Accordion defaultOpen className="rounded-2xl">
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
      <Accordion.Content unmountOnClose>
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
