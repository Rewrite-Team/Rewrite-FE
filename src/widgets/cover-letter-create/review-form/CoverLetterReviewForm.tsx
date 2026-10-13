'use client';

import { useRef, useState, type SubmitEvent } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  useCoverLetterCreateDraft,
  useCoverLetterCreateValidation,
  useSubmitCoverLetter,
  mapCoverLetterSubmitErrors,
} from '@/features/cover-letter/create-flow';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Accordion } from '@/shared/ui/accordion';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

interface CoverLetterReviewQuestionProps {
  answer: string;
  characterLimit: number | null;
  question: string;
  questionNumber: number;
}

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
          {characterLimit === null ? (
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
  const router = useRouter();
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const submitMutation = useSubmitCoverLetter(coverLetterId);
  const { setErrors } = useCoverLetterCreateValidation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const submittingRef = useRef(false);
  const draft = useCoverLetterCreateDraft();
  const coverLetter = draft?.coverLetter;
  const questions = [...(draft?.questions ?? [])]
    .sort((firstQuestion, secondQuestion) => firstQuestion.order - secondQuestion.order)
    .map((question) => ({
      answer: question.originalAnswer ?? '',
      characterLimit: question.maxAnswerLength,
      question: question.question ?? '',
    }));

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!submittingRef.current) setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrors([]);
    try {
      await submitMutation.mutateAsync();
      setIsConfirmOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        const errors = mapCoverLetterSubmitErrors(error.details);
        setErrors(errors);
        if (errors.length > 0) {
          setIsConfirmOpen(false);
          router.replace(
            ROUTES.WRITING_CREATE_STEP(
              coverLetterId,
              Math.min(...errors.map((error) => error.step))
            )
          );
        }
        appToast.error('입력 내용을 확인하고 다시 제출해 주세요.');
      } else if (error instanceof ApiError && error.status === 404) {
        appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
        router.replace(ROUTES.WRITING);
      } else if (error instanceof ApiError && error.code === 'CONFLICT') {
        router.replace(ROUTES.WRITING_DETAIL(coverLetterId));
      } else {
        appToast.error(
          error instanceof ApiError && error.code === 'LLM_JOB_ALREADY_RUNNING'
            ? '다른 AI 작업이 진행 중입니다. 완료 후 다시 시도해 주세요.'
            : '자기소개서를 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.'
        );
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <>
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
            <Input.Field readOnly value={coverLetter?.title ?? ''} />
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
                <Input.Field readOnly value={coverLetter?.companyName ?? ''} />
              </Input>

              <Input id="review-position-title" required>
                <Input.Label className="sr-only">희망 직무</Input.Label>
                <Input.Field readOnly value={coverLetter?.positionTitle ?? ''} />
              </Input>
            </div>
          </fieldset>

          <Input id="review-job-posting-url">
            <Input.Label>직무 공고 사이트 링크</Input.Label>
            <Input.Field readOnly type="url" value={coverLetter?.jobPostingUrl ?? ''} />
          </Input>
        </div>

        <div className="rounded-2xl bg-gray-800 p-6">
          <TextArea id="review-preferred-qualification" required>
            <TextArea.Label>공고 우대사항</TextArea.Label>
            <TextArea.Field
              className="h-81.75 min-h-81.75"
              readOnly
              value={coverLetter?.preferences ?? ''}
            />
          </TextArea>
        </div>

        {questions.map((question, index) => (
          <CoverLetterReviewQuestion
            key={`${index}-${question.question}`}
            questionNumber={index + 1}
            {...question}
          />
        ))}
      </form>
      <ConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="최종 제출하시겠습니까?"
        description="제출 후에는 수정할 수 없습니다."
        confirmLabel="제출"
        cancelLabel="취소"
        isLoading={submitMutation.isPending}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
