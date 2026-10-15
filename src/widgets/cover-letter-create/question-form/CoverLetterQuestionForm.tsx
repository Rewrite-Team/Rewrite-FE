'use client';

import { useEffect, useRef, useState, type Ref, type SubmitEvent } from 'react';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useFieldArray,
  useForm,
  type Control,
  type SubmitErrorHandler,
  type SubmitHandler,
} from 'react-hook-form';

import {
  useCoverLetterStepSave,
  coverLetterStep3Schema,
  type CoverLetterStep3FormInput,
  type CoverLetterStep3Values,
  useCoverLetterCreateDraft,
  useCoverLetterCreateValidation,
  useSaveCoverLetterQuestions,
} from '@/features/cover-letter/create-flow';
import { DeleteIcon } from '@/shared/assets/icons/side-menu';
import { Accordion } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

interface CoverLetterQuestionFieldsProps {
  appliedCharacterLimit?: number;
  control: Control<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>;
  index: number;
  isDeleteDisabled: boolean;
  isOpen: boolean;
  onApplyLength: () => void;
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
  appliedCharacterLimit,
  control,
  index,
  isDeleteDisabled,
  isOpen,
  onApplyLength,
  onDelete,
  onOpenChange,
  triggerRef,
}: CoverLetterQuestionFieldsProps) {
  const questionNumber = index + 1;

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
              <Input.FieldGroup>
                <Input.Field
                  {...field}
                  inputMode="numeric"
                  min={1}
                  placeholder="자기소개서 최대 글자 수를 입력해주세요"
                  step={1}
                  type="number"
                />
                <Button onClick={onApplyLength} size="sm" type="button">
                  적용
                </Button>
              </Input.FieldGroup>
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
              {appliedCharacterLimit === undefined ? (
                <TextArea.Field {...field} placeholder="자기소개서 내용을 작성해주세요" showCount />
              ) : (
                <TextArea.Field
                  {...field}
                  placeholder="자기소개서 내용을 작성해주세요"
                  recommendedLength={appliedCharacterLimit}
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
 * 문항은 하나씩 펼쳐 볼 수 있으며 입력한 글자 수를 답변의 권장 길이로 적용할 수 있습니다.
 */
export function CoverLetterQuestionForm() {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const draft = useCoverLetterCreateDraft();
  const { errors: submitErrors, setErrors: setSubmitErrors } = useCoverLetterCreateValidation();
  const saveMutation = useSaveCoverLetterQuestions(coverLetterId);
  const initialQuestions = draft?.questions.length
    ? [...draft.questions]
        .sort((firstQuestion, secondQuestion) => firstQuestion.order - secondQuestion.order)
        .map((question) => ({
          answer: question.originalAnswer ?? '',
          characterLimit: question.maxAnswerLength?.toString() ?? '',
          question: question.question ?? '',
        }))
    : DEFAULT_FORM_VALUES.questions;
  const questionTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(() => {
    const errors = submitErrors.filter((error) => error.step === 3);
    return errors.length > 0 ? Math.min(...errors.map((error) => error.index)) : 0;
  });
  const [appliedCharacterLimits, setAppliedCharacterLimits] = useState<Array<number | undefined>>(
    () =>
      initialQuestions.map((question) =>
        question.characterLimit.length > 0 ? Number(question.characterLimit) : undefined
      )
  );
  const {
    control,
    getValues,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    formState: { errors: formErrors },
  } = useForm<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>({
    defaultValues: { questions: initialQuestions },
    resolver: zodResolver(coverLetterStep3Schema),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    const errors = submitErrors.filter((error) => error.step === 3);
    if (errors.length === 0) return;
    for (const error of errors) setError(error.field, { type: 'server', message: error.reason });
    setSubmitErrors((errors) => errors.filter((error) => error.step !== 3));
  }, [submitErrors, setSubmitErrors, setError]);

  const handleOpenChange = (index: number) => (open: boolean) => {
    setOpenQuestionIndex(open ? index : null);
  };

  const handleApplyLength = (index: number) => async () => {
    const fieldName = `questions.${index}.characterLimit` as const;
    const isValid = await trigger(fieldName);
    const characterLimit = Number(getValues(fieldName));

    if (!isValid || !Number.isInteger(characterLimit) || characterLimit <= 0) return;

    setAppliedCharacterLimits((currentLimits) =>
      currentLimits.map((limit, limitIndex) => (limitIndex === index ? characterLimit : limit))
    );
  };

  const handleAddQuestion = () => {
    append({ ...EMPTY_QUESTION });
    setAppliedCharacterLimits((currentLimits) => [...currentLimits, undefined]);
    setOpenQuestionIndex(fields.length);
  };

  const handleDeleteQuestion = (index: number) => () => {
    if (fields.length <= 1) return;

    const focusTarget =
      questionTriggerRefs.current[index + 1] ?? questionTriggerRefs.current[index - 1];

    remove(index);
    setAppliedCharacterLimits((currentLimits) =>
      currentLimits.filter((_, limitIndex) => limitIndex !== index)
    );
    setOpenQuestionIndex((currentIndex) => {
      if (currentIndex === null || currentIndex < index) return currentIndex;
      if (currentIndex > index) return currentIndex - 1;

      return Math.min(index, fields.length - 2);
    });
    focusTarget?.focus();
  };

  const saveQuestions = useCoverLetterStepSave<CoverLetterStep3FormInput>({
    coverLetterId,
    nextStep: 4,
    clearErrors,
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
    onValidationErrors: (errors, values) => {
      let firstInvalidIndex: number | undefined;
      for (const error of errors) {
        if (
          error.step !== 3 ||
          error.field === 'root.questions' ||
          error.index >= values.questions.length
        )
          continue;
        setError(error.field, { type: 'server', message: error.reason });
        firstInvalidIndex = Math.min(firstInvalidIndex ?? error.index, error.index);
      }
      if (firstInvalidIndex !== undefined) setOpenQuestionIndex(firstInvalidIndex);
    },
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

  const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const submitter = event.nativeEvent.submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === 'save-draft') {
      event.preventDefault();
      void saveQuestions(getValues(), { intent: 'draft' });
      return;
    }
    void handleSubmit(handleValidSubmit, handleInvalidSubmit)(event);
  };

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
            appliedCharacterLimit={appliedCharacterLimits[index]}
            control={control}
            index={index}
            isDeleteDisabled={fields.length <= 1}
            isOpen={openQuestionIndex === index}
            key={field.id}
            onApplyLength={handleApplyLength(index)}
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
    </form>
  );
}
