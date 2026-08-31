'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  useFieldArray,
  useForm,
  type Control,
  type SubmitErrorHandler,
  type SubmitHandler,
} from 'react-hook-form';

import { ROUTES } from '@/shared/constants/routes';
import { Accordion } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

interface CoverLetterQuestion {
  answer: string;
  characterLimit: string;
  question: string;
}

interface CoverLetterQuestionFormValues {
  questions: CoverLetterQuestion[];
}

interface CoverLetterQuestionFieldsProps {
  answerLength?: number;
  control: Control<CoverLetterQuestionFormValues>;
  index: number;
  isOpen: boolean;
  onApplyLength: () => void;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_QUESTION: CoverLetterQuestion = {
  answer: '',
  characterLimit: '',
  question: '',
};

const DEFAULT_FORM_VALUES: CoverLetterQuestionFormValues = {
  questions: [{ ...EMPTY_QUESTION }],
};

const REQUIRED_QUESTION_MESSAGE = '자기소개서 질문을 입력해주세요.';
const REQUIRED_ANSWER_MESSAGE = '자기소개서 내용을 입력해주세요.';
const INVALID_CHARACTER_LIMIT_MESSAGE = '글자 수는 1 이상의 숫자로 입력해주세요.';

const validateRequiredText = (value: string, message: string) => value.trim().length > 0 || message;

/** 하나의 자기소개서 문항과 답변 입력 영역을 구성합니다. */
function CoverLetterQuestionFields({
  answerLength,
  control,
  index,
  isOpen,
  onApplyLength,
  onOpenChange,
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
              <div className="flex items-center gap-2 text-white">
                <Accordion.Trigger
                  aria-label={`${questionNumber}번 자기소개서 문항 접기 또는 펼치기`}
                />
                <Accordion.Label asChild>
                  <Input.Label>질문</Input.Label>
                </Accordion.Label>
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
          rules={{
            required: REQUIRED_QUESTION_MESSAGE,
            validate: (value) => validateRequiredText(value, REQUIRED_QUESTION_MESSAGE),
          }}
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
          rules={{
            validate: (value) =>
              value === '' ||
              (/^\d+$/.test(value) && Number(value) > 0) ||
              INVALID_CHARACTER_LIMIT_MESSAGE,
          }}
        />

        <FormField
          control={control}
          name={`questions.${index}.answer`}
          render={({ errorMessage, field, invalid }) => (
            <TextArea id={`cover-letter-answer-${questionNumber}`} invalid={invalid} required>
              <TextArea.Label>자기소개서 내용</TextArea.Label>
              {answerLength === undefined ? (
                <TextArea.Field {...field} placeholder="자기소개서 내용을 작성해주세요" showCount />
              ) : (
                <TextArea.Field
                  {...field}
                  placeholder="자기소개서 내용을 작성해주세요"
                  recommendedLength={answerLength}
                  showCount
                />
              )}
              <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
            </TextArea>
          )}
          rules={{
            required: REQUIRED_ANSWER_MESSAGE,
            validate: (value) => validateRequiredText(value, REQUIRED_ANSWER_MESSAGE),
          }}
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
  const router = useRouter();
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
  const [answerLengths, setAnswerLengths] = useState<Array<number | undefined>>([undefined]);
  const { control, getValues, handleSubmit, trigger } = useForm<CoverLetterQuestionFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { append, fields } = useFieldArray({
    control,
    name: 'questions',
  });

  const handleOpenChange = (index: number) => (open: boolean) => {
    setOpenQuestionIndex(open ? index : null);
  };

  const handleApplyLength = (index: number) => async () => {
    const fieldName = `questions.${index}.characterLimit` as const;
    const isValid = await trigger(fieldName);
    const characterLimit = Number(getValues(fieldName));

    if (!isValid || !Number.isInteger(characterLimit) || characterLimit <= 0) return;

    setAnswerLengths((currentLengths) =>
      currentLengths.map((length, lengthIndex) => (lengthIndex === index ? characterLimit : length))
    );
  };

  const handleAddQuestion = () => {
    append({ ...EMPTY_QUESTION });
    setAnswerLengths((currentLengths) => [...currentLengths, undefined]);
    setOpenQuestionIndex(fields.length);
  };

  const handleValidSubmit: SubmitHandler<CoverLetterQuestionFormValues> = () => {
    // TODO: 문항과 답변 저장 API가 연결되면 저장 성공 후 STEP4로 이동한다.
    router.push(ROUTES.WRITING_CREATE_STEP(4));
  };

  const handleInvalidSubmit: SubmitErrorHandler<CoverLetterQuestionFormValues> = (errors) => {
    const questionErrors = errors.questions;

    if (!Array.isArray(questionErrors)) return;

    const firstInvalidQuestionIndex = questionErrors.findIndex(Boolean);

    if (firstInvalidQuestionIndex >= 0) {
      setOpenQuestionIndex(firstInvalidQuestionIndex);
    }
  };

  return (
    <form
      aria-label="자기소개서 문항 및 답변"
      className="flex flex-col gap-12"
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
    >
      {fields.map((field, index) => (
        <CoverLetterQuestionFields
          answerLength={answerLengths[index]}
          control={control}
          index={index}
          isOpen={openQuestionIndex === index}
          key={field.id}
          onApplyLength={handleApplyLength(index)}
          onOpenChange={handleOpenChange(index)}
        />
      ))}

      <Button className="w-full" onClick={handleAddQuestion} type="button" variant="outline">
        문항 추가
      </Button>
    </form>
  );
}
