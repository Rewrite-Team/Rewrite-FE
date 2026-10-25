'use client';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  useCoverLetterStepSave,
  useCoverLetterStepDirty,
  coverLetterStep2Schema,
  type CoverLetterStep2FormInput,
  type CoverLetterStep2Values,
  useCoverLetterCreateDraft,
  useCoverLetterStepErrors,
  createCoverLetterStepSubmitHandler,
  getCoverLetterStep2DefaultValues,
  useSaveCoverLetterPreferences,
} from '@/features/cover-letter/create-flow';
import { INPUT_LIMITS } from '@/shared/constants/limits';
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
  const saveMutation = useSaveCoverLetterPreferences(coverLetterId);
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    reset,
    formState: { isDirty },
  } = useForm<CoverLetterStep2FormInput, unknown, CoverLetterStep2Values>({
    defaultValues: getCoverLetterStep2DefaultValues(draft),
    resolver: zodResolver(coverLetterStep2Schema),
  });

  useCoverLetterStepDirty(2, isDirty);

  useCoverLetterStepErrors({
    step: 2,
    applyError: (error) => setError(error.field, { type: 'server', message: error.reason }),
    focusError: (error) => setFocus(error.field),
  });

  const savePreferences = useCoverLetterStepSave<CoverLetterStep2FormInput>({
    coverLetterId,
    currentStep: 2,
    isDirty,
    clearErrors,
    getValues,
    // 저장 중 입력한 값은 보존하고, 성공한 요청의 값만 비교 기준으로 갱신합니다.
    onSaved: (values) => reset(values, { keepValues: true }),
    validateDraft: (values) => {
      // 미완성 입력은 저장하되 값이 있으면 다음 단계와 같은 길이 제한을 적용합니다.
      if (values.preferredQualification.trim() === '') return true;
      const result = coverLetterStep2Schema.shape.preferredQualification.safeParse(
        values.preferredQualification
      );
      if (result.success) return true;
      setError('preferredQualification', {
        type: 'validate',
        message: result.error.issues[0].message,
      });
      setFocus('preferredQualification');
      return false;
    },
    saveDraft: (values) =>
      saveMutation.mutateAsync({
        preferences: values.preferredQualification.trim() || null,
      }),
  });

  const handleValidSubmit: SubmitHandler<CoverLetterStep2Values> = (values) =>
    savePreferences(values, { intent: 'next' });

  const handleFormSubmit = createCoverLetterStepSubmitHandler({
    saveDraft: () => savePreferences(getValues(), { intent: 'draft' }),
    submitNext: handleSubmit(handleValidSubmit),
  });

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
                recommendedLength={INPUT_LIMITS.COVER_LETTER_PREFERENCES}
                showCount
              />
              <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
            </TextArea>
          )}
        />
      </div>
    </form>
  );
}
