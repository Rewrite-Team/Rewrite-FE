'use client';

import type { Ref } from 'react';

import { useWatch, type Control } from 'react-hook-form';

import {
  coverLetterQuestionSchema,
  type CoverLetterStep3FormInput,
  type CoverLetterStep3Values,
} from '@/features/cover-letter/create-flow';
import { DeleteIcon } from '@/shared/assets/icons/side-menu';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { Accordion } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';

interface CoverLetterQuestionFieldsProps {
  control: Control<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>;
  index: number;
  isDeleteDisabled: boolean;
  isOpen: boolean;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  triggerRef: Ref<HTMLButtonElement>;
}

/** 하나의 자기소개서 문항과 답변 입력 영역을 구성합니다. */
export function CoverLetterQuestionFields({
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
                  placeholder={`자기소개서 질문을 입력해주세요 (최대 ${INPUT_LIMITS.COVER_LETTER_QUESTION}자)`}
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
                min={INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MIN}
                max={INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MAX}
                placeholder={`${INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MIN}~${INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MAX}자 범위로 입력해주세요`}
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
                <TextArea.Field
                  {...field}
                  placeholder={`자기소개서 내용을 작성해주세요 (최대 ${INPUT_LIMITS.COVER_LETTER_ANSWER}자)`}
                  showCount
                />
              ) : (
                <TextArea.Field
                  {...field}
                  placeholder={`자기소개서 내용을 작성해주세요 (최대 ${INPUT_LIMITS.COVER_LETTER_ANSWER}자)`}
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
