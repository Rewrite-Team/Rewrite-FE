'use client';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';

import {
  useCoverLetterStepSave,
  useCoverLetterStepDirty,
  coverLetterStep3Schema,
  coverLetterQuestionSchema,
  type CoverLetterStep3FormInput,
  type CoverLetterStep3Values,
  useCoverLetterCreateDraft,
  useCoverLetterStepErrors,
  createCoverLetterStepSubmitHandler,
  getCoverLetterStep3DefaultValues,
  useSaveCoverLetterQuestions,
} from '@/features/cover-letter/create-flow';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { EMPTY_QUESTION } from './constants';
import { CoverLetterQuestionFields } from './CoverLetterQuestionFields';
import { useCoverLetterQuestions } from './hooks/useCoverLetterQuestions';

/**
 * ## CoverLetterQuestionForm
 *
 * @description
 * 자기소개서 등록 STEP3에서 여러 문항과 답변을 작성하는 폼입니다.
 * 문항은 하나씩 펼쳐 볼 수 있으며 유효한 글자 수 입력은 답변의 권장 길이에 즉시 반영됩니다.
 */
export function CoverLetterQuestionForm() {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const draft = useCoverLetterCreateDraft();
  const saveMutation = useSaveCoverLetterQuestions(coverLetterId);
  const { questions } = getCoverLetterStep3DefaultValues(draft);
  const initialQuestions = questions.length > 0 ? questions : [{ ...EMPTY_QUESTION }];
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    reset,
    formState: { errors: formErrors, isDirty },
  } = useForm<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>({
    defaultValues: { questions: initialQuestions },
    resolver: zodResolver(coverLetterStep3Schema),
  });
  const {
    fields,
    openQuestionIndex,
    pendingDeleteIndex,
    registerQuestionTrigger,
    openQuestion,
    focusQuestionField,
    handleOpenChange,
    handleAddQuestion,
    handleDeleteQuestion,
    handleDeleteModalOpenChange,
    handleConfirmDelete,
  } = useCoverLetterQuestions({ control, getValues, setFocus, isSaving: saveMutation.isPending });

  useCoverLetterStepDirty(3, isDirty);

  useCoverLetterStepErrors({
    step: 3,
    applyError: (error) => setError(error.field, { type: 'server', message: error.reason }),
    focusError: (error) =>
      focusQuestionField(
        error.index,
        error.field === 'root.questions' ? 'questions.0.question' : error.field
      ),
  });

  const saveQuestions = useCoverLetterStepSave<CoverLetterStep3FormInput>({
    coverLetterId,
    currentStep: 3,
    isDirty,
    clearErrors,
    getValues,
    // 저장 중 입력한 값은 보존하고, 성공한 요청의 값만 비교 기준으로 갱신합니다.
    onSaved: (values) => reset(values, { keepValues: true }),
    validateDraft: (values) => {
      let firstInvalidField:
        | { index: number; field: keyof CoverLetterStep3FormInput['questions'][number] }
        | undefined;
      for (const [index, question] of values.questions.entries()) {
        for (const field of ['question', 'characterLimit', 'answer'] as const) {
          // 질문과 답변의 필수 여부만 생략하고 형식·범위는 공통 스키마로 검증합니다.
          if (field !== 'characterLimit' && question[field].trim() === '') continue;
          const result = coverLetterQuestionSchema.shape[field].safeParse(question[field]);
          if (result.success) continue;
          setError(`questions.${index}.${field}`, {
            type: 'validate',
            message: result.error.issues[0].message,
          });
          firstInvalidField ??= { index, field };
        }
      }
      if (!firstInvalidField) return true;
      focusQuestionField(
        firstInvalidField.index,
        `questions.${firstInvalidField.index}.${firstInvalidField.field}`
      );
      return false;
    },
    saveDraft: (values) =>
      saveMutation.mutateAsync({
        questions: values.questions.map(({ question, answer, characterLimit }) => ({
          question: question.trim() || null,
          originalAnswer: answer.trim() || null,
          maxAnswerLength: characterLimit.trim() === '' ? null : Number(characterLimit),
        })),
      }),
  });

  const handleValidSubmit: SubmitHandler<CoverLetterStep3Values> = (values) =>
    saveQuestions(
      {
        questions: values.questions.map((question) => ({
          ...question,
          characterLimit: question.characterLimit?.toString() ?? '',
        })),
      },
      { intent: 'next' }
    );

  const handleInvalidSubmit: SubmitErrorHandler<CoverLetterStep3FormInput> = (errors) => {
    const questionErrors = errors.questions;

    if (!Array.isArray(questionErrors)) return;

    const firstInvalidQuestionIndex = questionErrors.findIndex(Boolean);

    if (firstInvalidQuestionIndex >= 0) {
      openQuestion(firstInvalidQuestionIndex);
    }
  };

  const handleFormSubmit = createCoverLetterStepSubmitHandler({
    saveDraft: () => saveQuestions(getValues(), { intent: 'draft' }),
    submitNext: handleSubmit(handleValidSubmit, handleInvalidSubmit),
  });

  return (
    <form
      aria-label="자기소개서 문항 및 답변"
      aria-busy={saveMutation.isPending}
      className="flex flex-col gap-12"
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleFormSubmit}
    >
      <fieldset className="contents" disabled={saveMutation.isPending}>
        {formErrors.root?.questions?.message ? (
          <p className="body-14 text-error-500" role="alert">
            {formErrors.root.questions.message}
          </p>
        ) : null}
        {fields.map((field, index) => (
          <CoverLetterQuestionFields
            control={control}
            index={index}
            isDeleteDisabled={fields.length <= 1}
            isOpen={openQuestionIndex === index}
            key={field.id}
            onDelete={handleDeleteQuestion(index)}
            onOpenChange={handleOpenChange(index)}
            triggerRef={(element) => {
              registerQuestionTrigger(index, element);
            }}
          />
        ))}

        <Button className="w-full" onClick={handleAddQuestion} type="button" variant="outline">
          문항 추가
        </Button>
      </fieldset>
      <ConfirmModal
        open={pendingDeleteIndex !== null}
        title={`${(pendingDeleteIndex ?? 0) + 1}번 문항을 삭제할까요?`}
        description={
          <>
            입력한 질문과 답변이 삭제됩니다.
            <br />
            삭제 후에는 복구할 수 없습니다.
          </>
        }
        confirmLabel="삭제하기"
        cancelLabel="취소"
        restoreFocus={false}
        onOpenChange={handleDeleteModalOpenChange}
        onConfirm={handleConfirmDelete}
      />
    </form>
  );
}
