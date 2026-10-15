'use client';

import { useEffect, type SubmitEvent } from 'react';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  useCoverLetterStepSave,
  coverLetterStep2Schema,
  type CoverLetterStep2FormInput,
  type CoverLetterStep2Values,
  useCoverLetterCreateDraft,
  useCoverLetterCreateValidation,
  useSaveCoverLetterPreferences,
} from '@/features/cover-letter/create-flow';
import { FormField } from '@/shared/ui/form-field';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

/**
 * ## CoverLetterPreferredQualificationForm
 *
 * @description
 * 자기소개서 등록 STEP2에서 채용 공고의 우대사항을 입력하는 폼입니다.
 * 미완성 입력은 임시 저장하고, 다음 단계 이동은 필수값 검증과 저장 후 수행합니다.
 */
export function CoverLetterPreferredQualificationForm() {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const draft = useCoverLetterCreateDraft();
  const { errors: submitErrors } = useCoverLetterCreateValidation();
  const saveMutation = useSaveCoverLetterPreferences(coverLetterId);
  const { control, getValues, handleSubmit, setError, setFocus, clearErrors } = useForm<
    CoverLetterStep2FormInput,
    unknown,
    CoverLetterStep2Values
  >({
    defaultValues: {
      preferredQualification: draft?.coverLetter.preferences ?? '',
    },
    resolver: zodResolver(coverLetterStep2Schema),
  });

  useEffect(() => {
    const errors = submitErrors.filter((error) => error.step === 2);
    if (errors.length === 0) return;
    for (const error of errors) setError(error.field, { type: 'server', message: error.reason });
    const frame = requestAnimationFrame(() => setFocus(errors[0].field));
    return () => cancelAnimationFrame(frame);
  }, [submitErrors, setError, setFocus]);

  const savePreferences = useCoverLetterStepSave<CoverLetterStep2FormInput>({
    coverLetterId,
    nextStep: 3,
    clearErrors,
    errorMessage: '우대사항을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    saveDraft: (values) =>
      saveMutation.mutateAsync({
        preferences: values.preferredQualification.trim() || null,
      }),
    onValidationErrors: (errors) => {
      const fieldError = errors.find((error) => error.step === 2);
      if (fieldError) setError(fieldError.field, { type: 'server', message: fieldError.reason });
    },
  });

  const handleValidSubmit: SubmitHandler<CoverLetterStep2Values> = (values) =>
    savePreferences(values, { intent: 'next' });

  const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const submitter = event.nativeEvent.submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === 'save-draft') {
      event.preventDefault();
      void savePreferences(getValues(), { intent: 'draft' });
      return;
    }
    void handleSubmit(handleValidSubmit)(event);
  };

  return (
    <form
      aria-label="채용 공고 우대사항"
      aria-busy={saveMutation.isPending}
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleFormSubmit}
    >
      <div className="rounded-2xl bg-gray-800 p-6">
        <FormField
          control={control}
          name="preferredQualification"
          render={({ errorMessage, field, invalid }) => (
            <TextArea id="preferred-qualification" invalid={invalid} required>
              <TextArea.Label className="mb-6 leading-5.5">공고 우대사항</TextArea.Label>
              <TextArea.Field
                {...field}
                className="h-85.5 min-h-85.5"
                placeholder="공고의 우대사항을 입력해주세요. 자기소개서가 직무와 더 잘 연결되도록 첨삭에 반영됩니다."
              />
              <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
            </TextArea>
          )}
        />
      </div>
    </form>
  );
}
