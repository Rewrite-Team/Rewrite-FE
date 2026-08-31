'use client';

import type { SubmitEvent } from 'react';

import { Accordion } from '@/shared/ui/accordion';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

interface CoverLetterReviewQuestion {
  answer: string;
  characterLimit?: number;
  question: string;
}

interface CoverLetterReviewData {
  companyName: string;
  jobPostingUrl: string;
  positionTitle: string;
  preferredQualification: string;
  questions: CoverLetterReviewQuestion[];
  title: string;
}

interface CoverLetterReviewQuestionProps extends CoverLetterReviewQuestion {
  questionNumber: number;
}

const PUBLISHING_REVIEW_DATA: CoverLetterReviewData = {
  companyName: '카카오',
  jobPostingUrl: 'https://어쩌구저쩌구.com',
  positionTitle: '프론트엔드 개발자',
  preferredQualification: '착하고 착하고 착한 사람 찾아요~!',
  questions: [
    {
      answer: '이서정입니다람쥐~',
      characterLimit: 700,
      question: '이름이 무엇입니까?',
    },
  ],
  title: '카카오 자기소개서',
};

/** 최종 확인 화면에서 하나의 자기소개서 문항과 답변을 표시합니다. */
function CoverLetterReviewQuestion({
  answer,
  characterLimit,
  question,
  questionNumber,
}: CoverLetterReviewQuestionProps) {
  return (
    <Accordion className="rounded-2xl" defaultOpen>
      <Accordion.Header>
        <Input id={`review-question-${questionNumber}`} required>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger
              aria-label={`${questionNumber}번 자기소개서 문항 접기 또는 펼치기`}
            />
            <Accordion.Label asChild>
              <Input.Label>질문</Input.Label>
            </Accordion.Label>
          </div>

          <div className="pt-3">
            <Input.Field readOnly value={question} />
          </div>
        </Input>
      </Accordion.Header>

      <Accordion.Content>
        <Input id={`review-character-limit-${questionNumber}`}>
          <Input.Label>자기소개서 글자 수</Input.Label>
          <Input.Field readOnly value={characterLimit?.toString() ?? ''} />
        </Input>

        <TextArea id={`review-answer-${questionNumber}`} required>
          <TextArea.Label>자기소개서 내용</TextArea.Label>
          {characterLimit === undefined ? (
            <TextArea.Field readOnly showCount value={answer} />
          ) : (
            <TextArea.Field readOnly recommendedLength={characterLimit} showCount value={answer} />
          )}
        </TextArea>
      </Accordion.Content>
    </Accordion>
  );
}

/**
 * ## CoverLetterReviewForm
 *
 * @description
 * 자기소개서 등록 STEP4에서 이전 단계에 입력한 기본 정보, 우대사항, 문항과 답변을
 * 읽기 전용으로 확인하는 폼입니다.
 */
export function CoverLetterReviewForm() {
  const review = PUBLISHING_REVIEW_DATA;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: 최종 제출 확인 모달과 자기소개서 완료 API를 연결한다.
  };

  return (
    <form
      aria-label="자기소개서 최종 확인"
      className="flex flex-col gap-12"
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="rounded-2xl bg-gray-800 p-6">
        <Input id="review-title" required>
          <Input.Label>자기소개서 제목</Input.Label>
          <Input.Field readOnly value={review.title} />
        </Input>
      </div>

      <div className="flex flex-col gap-12 rounded-2xl bg-gray-800 p-6">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="body-18 font-semibold text-white">
            회사/직무{' '}
            <span aria-hidden="true" className="text-primary-500">
              *
            </span>
          </legend>

          <div className="mt-3 flex flex-col gap-3">
            <Input id="review-company-name" required>
              <Input.Label className="sr-only">회사명</Input.Label>
              <Input.Field readOnly value={review.companyName} />
            </Input>

            <Input id="review-position-title" required>
              <Input.Label className="sr-only">희망 직무</Input.Label>
              <Input.Field readOnly value={review.positionTitle} />
            </Input>
          </div>
        </fieldset>

        <Input id="review-job-posting-url">
          <Input.Label>직무 공고 사이트 링크</Input.Label>
          <Input.Field readOnly type="url" value={review.jobPostingUrl} />
        </Input>
      </div>

      <div className="rounded-2xl bg-gray-800 p-6">
        <TextArea id="review-preferred-qualification" required>
          <TextArea.Label>공고 우대사항</TextArea.Label>
          <TextArea.Field
            className="h-81.75 min-h-81.75"
            readOnly
            value={review.preferredQualification}
          />
        </TextArea>
      </div>

      {review.questions.map((question, index) => (
        <CoverLetterReviewQuestion
          key={`${index}-${question.question}`}
          questionNumber={index + 1}
          {...question}
        />
      ))}
    </form>
  );
}
