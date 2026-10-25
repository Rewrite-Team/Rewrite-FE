'use client';

import { useRef, useState, type Ref } from 'react';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type SubmitErrorHandler,
  type SubmitHandler,
} from 'react-hook-form';

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
import { DeleteIcon } from '@/shared/assets/icons/side-menu';
import { Accordion } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

interface CoverLetterQuestionFieldsProps {
  control: Control<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>;
  index: number;
  isDeleteDisabled: boolean;
  isOpen: boolean;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  triggerRef: Ref<HTMLButtonElement>;
}

const EMPTY_QUESTION: CoverLetterStep3FormInput['questions'][number] = {
  answer: '',
  characterLimit: '',
  question: '',
};

const DEFAULT_FORM_VALUES: CoverLetterStep3FormInput = {
  questions: [{ ...EMPTY_QUESTION }],
};

/** 하나의 자기소개서 문항과 답변 입력 영역을 구성합니다. */
function CoverLetterQuestionFields({
  control,
  index,
  isDeleteDisabled,
  isOpen,
  onDelete,
  onOpenChange,
  triggerRef,
}: CoverLetterQuestionFieldsProps) {
  const questionNumber = index + 1;
  const characterLimit = useWatch({ control, name: `questions.${index}.characterLimit` });
  const parsedCharacterLimit =
    coverLetterQuestionSchema.shape.characterLimit.safeParse(characterLimit);
  const recommendedLength = parsedCharacterLimit.success ? parsedCharacterLimit.data : undefined;

  return (
    <Accordion className="rounded-2xl" onOpenChange={onOpenChange} open={isOpen}>
      <Accordion.Header>
        <FormField
          control={control}
          name={`questions.${index}.question`}
          render={({ errorMessage, field, invalid }) => (
            <Input id={`cover-letter-question-${questionNumber}`} invalid={invalid} required>
              <div className="flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2">
                  <Accordion.Trigger
                    aria-label={`${questionNumber}번 자기소개서 문항 접기 또는 펼치기`}
                    ref={triggerRef}
                  />
                  <Accordion.Label asChild>
                    <Input.Label>질문</Input.Label>
                  </Accordion.Label>
                </div>

                <Button
                  aria-label={`${questionNumber}번 자기소개서 문항 삭제`}
                  disabled={isDeleteDisabled}
                  iconOnly
                  onClick={onDelete}
                  type="button"
                  variant="ghost"
                >
                  <DeleteIcon aria-hidden="true" className="size-5" />
                </Button>
              </div>

              <div className="pt-3">
                <Input.Field
                  {...field}
                  autoComplete="off"
                  placeholder="자기소개서 질문을 입력해주세요"
                />
                <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
              </div>
            </Input>
          )}
        />
      </Accordion.Header>

      <Accordion.Content>
        <FormField
          control={control}
          name={`questions.${index}.characterLimit`}
          render={({ errorMessage, field, invalid }) => (
            <Input id={`cover-letter-character-limit-${questionNumber}`} invalid={invalid}>
              <Input.Label>자기소개서 글자 수</Input.Label>
              <Input.Field
                {...field}
                inputMode="numeric"
                min={1}
                placeholder="자기소개서 최대 글자 수를 입력해주세요"
                step={1}
                type="number"
              />
              <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
            </Input>
          )}
        />

        <FormField
          control={control}
          name={`questions.${index}.answer`}
          render={({ errorMessage, field, invalid }) => (
            <TextArea id={`cover-letter-answer-${questionNumber}`} invalid={invalid} required>
              <TextArea.Label>자기소개서 내용</TextArea.Label>
              {recommendedLength === undefined ? (
                <TextArea.Field {...field} placeholder="자기소개서 내용을 작성해주세요" showCount />
              ) : (
                <TextArea.Field
                  {...field}
                  placeholder="자기소개서 내용을 작성해주세요"
                  recommendedLength={recommendedLength}
                  showCount
                />
              )}
              <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
            </TextArea>
          )}
        />
      </Accordion.Content>
    </Accordion>
  );
}

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
  const initialQuestions = questions.length > 0 ? questions : DEFAULT_FORM_VALUES.questions;
  const questionTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
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
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useCoverLetterStepDirty(3, isDirty);

  useCoverLetterStepErrors({
    step: 3,
    applyError: (error) => setError(error.field, { type: 'server', message: error.reason }),
    focusError: (error) => {
      if (error.index >= getValues('questions').length) return;
      setOpenQuestionIndex(error.index);
      // 문항의 inert가 해제된 다음 프레임에 입력란으로 포커스를 옮깁니다.
      const frame = requestAnimationFrame(() => {
        setFocus(error.field === 'root.questions' ? 'questions.0.question' : error.field);
      });
      return () => cancelAnimationFrame(frame);
    },
  });

  const handleOpenChange = (index: number) => (open: boolean) => {
    setOpenQuestionIndex(open ? index : null);
  };

  const handleAddQuestion = () => {
    append({ ...EMPTY_QUESTION });
    setOpenQuestionIndex(fields.length);
  };

  const deleteQuestion = (index: number) => {
    if (fields.length <= 1 || saveMutation.isPending) return;

    const focusTarget =
      questionTriggerRefs.current[index + 1] ?? questionTriggerRefs.current[index - 1];

    remove(index);
    setOpenQuestionIndex((currentIndex) => {
      if (currentIndex === null || currentIndex < index) return currentIndex;
      if (currentIndex > index) return currentIndex - 1;

      return Math.min(index, fields.length - 2);
    });
    if (pendingDeleteIndex === null) {
      focusTarget?.focus();
    } else {
      // 모달의 포커스 제한이 해제된 뒤 남은 문항으로 이동합니다.
      requestAnimationFrame(() => focusTarget?.focus());
    }
  };

  const handleDeleteQuestion = (index: number) => () => {
    if (fields.length <= 1 || saveMutation.isPending) return;
    const values = getValues(`questions.${index}`);
    const hasContent = Object.values(values).some((value) => value.trim().length > 0);
    if (hasContent) {
      setPendingDeleteIndex(index);
      return;
    }
    deleteQuestion(index);
  };

  const saveQuestions = useCoverLetterStepSave<CoverLetterStep3FormInput>({
    coverLetterId,
    currentStep: 3,
    isDirty,
    clearErrors,
    getValues,
    // 저장 중 입력한 값은 보존하고, 성공한 요청의 값만 비교 기준으로 갱신합니다.
    onSaved: (values) => reset(values, { keepValues: true }),
    errorMessage: '문항과 답변을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    validateDraft: (values) => {
      const invalidLengthIndex = values.questions.findIndex(
        ({ characterLimit }) =>
          characterLimit.trim() !== '' && !Number.isSafeInteger(Number(characterLimit))
      );
      if (invalidLengthIndex < 0) return true;
      setError(`questions.${invalidLengthIndex}.characterLimit`, {
        type: 'validate',
        message: '글자 수는 정수로 입력해주세요.',
      });
      setOpenQuestionIndex(invalidLengthIndex);
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
      setOpenQuestionIndex(firstInvalidQuestionIndex);
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
              questionTriggerRefs.current[index] = element;
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
        onOpenChange={(open) => {
          if (open || pendingDeleteIndex === null) return;
          const focusTarget = questionTriggerRefs.current[pendingDeleteIndex];
          setPendingDeleteIndex(null);
          requestAnimationFrame(() => focusTarget?.focus());
        }}
        onConfirm={() => {
          if (pendingDeleteIndex === null) return;
          deleteQuestion(pendingDeleteIndex);
          setPendingDeleteIndex(null);
        }}
      />
    </form>
  );
}
