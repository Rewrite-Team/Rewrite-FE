'use client';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  useCoverLetterStepSave,
  useCoverLetterStepDirty,
  coverLetterStep1Schema,
  type CoverLetterStep1FormInput,
  type CoverLetterStep1Values,
  useCoverLetterCreateDraft,
  useCoverLetterStepErrors,
  createCoverLetterStepSubmitHandler,
  getCoverLetterStep1DefaultValues,
  useSaveCoverLetterBasicInfo,
} from '@/features/cover-letter/create-flow';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

/**
 * 자기소개서 등록 STEP1의 제목과 지원 회사·직무 정보를 입력하는 폼입니다.
 * 미완성 입력은 임시 저장하고, 다음 단계 이동은 필수값 검증과 저장 후 수행합니다.
 */
export function CoverLetterBasicInfoForm() {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const draft = useCoverLetterCreateDraft();
  const saveMutation = useSaveCoverLetterBasicInfo(coverLetterId);
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    reset,
    formState: { isDirty },
  } = useForm<CoverLetterStep1FormInput, unknown, CoverLetterStep1Values>({
    defaultValues: getCoverLetterStep1DefaultValues(draft),
    resolver: zodResolver(coverLetterStep1Schema),
  });

  useCoverLetterStepDirty(1, isDirty);

  useCoverLetterStepErrors({
    step: 1,
    applyError: (error) => setError(error.field, { type: 'server', message: error.reason }),
    focusError: (error) => setFocus(error.field),
  });

  const saveBasicInfo = useCoverLetterStepSave<CoverLetterStep1FormInput>({
    coverLetterId,
    currentStep: 1,
    isDirty,
    clearErrors,
    getValues,
    // 저장 중 입력한 값은 보존하고, 성공한 요청의 값만 비교 기준으로 갱신합니다.
    onSaved: (values) => reset(values, { keepValues: true }),
    saveDraft: (values) =>
      saveMutation.mutateAsync({
        title: values.title.trim() || null,
        companyName: values.companyName.trim() || null,
        positionTitle: values.positionTitle.trim() || null,
        jobPostingUrl: values.jobPostingUrl.trim() || null,
      }),
  });

  const handleValidSubmit: SubmitHandler<CoverLetterStep1Values> = (values) =>
    saveBasicInfo(values, { intent: 'next' });

  const handleFormSubmit = createCoverLetterStepSubmitHandler({
    saveDraft: () => saveBasicInfo(getValues(), { intent: 'draft' }),
    submitNext: handleSubmit(handleValidSubmit),
  });

  return (
    <form
      aria-label="자기소개서 기본 정보"
      aria-busy={saveMutation.isPending}
      className="flex flex-col gap-12"
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleFormSubmit}
    >
      <div className="rounded-2xl bg-gray-800 p-6">
        <FormField
          control={control}
          name="title"
          render={({ errorMessage, field, invalid }) => (
            <Input id="cover-letter-title" invalid={invalid} required>
              <Input.Label>자기소개서 제목</Input.Label>
              <Input.Field
                {...field}
                autoComplete="off"
                maxLength={INPUT_LIMITS.COVER_LETTER_TITLE}
                placeholder="자기소개서 제목을 입력해주세요"
              />
              <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
            </Input>
          )}
        />
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
            <FormField
              control={control}
              name="companyName"
              render={({ errorMessage, field, invalid }) => (
                <Input id="company-name" invalid={invalid} required>
                  <Input.Label className="sr-only">회사명</Input.Label>
                  <Input.Field
                    {...field}
                    autoComplete="organization"
                    maxLength={INPUT_LIMITS.COVER_LETTER_COMPANY_NAME}
                    placeholder="회사 명을 작성해주세요"
                  />
                  <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
                </Input>
              )}
            />

            <FormField
              control={control}
              name="positionTitle"
              render={({ errorMessage, field, invalid }) => (
                <Input id="position-title" invalid={invalid} required>
                  <Input.Label className="sr-only">희망 직무</Input.Label>
                  <Input.Field
                    {...field}
                    autoComplete="organization-title"
                    maxLength={INPUT_LIMITS.COVER_LETTER_POSITION_TITLE}
                    placeholder="희망 직무를 작성해주세요"
                  />
                  <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
                </Input>
              )}
            />
          </div>
        </fieldset>

        <FormField
          control={control}
          name="jobPostingUrl"
          render={({ errorMessage, field, invalid }) => (
            <Input id="job-posting-url" invalid={invalid}>
              <Input.Label>직무 공고 사이트 링크</Input.Label>
              <Input.Field
                {...field}
                maxLength={INPUT_LIMITS.COVER_LETTER_JOB_POSTING_URL}
                placeholder="해당 직무 공고의 사이트 링크를 붙여주세요"
                type="url"
              />
              <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
            </Input>
          )}
        />
      </div>
    </form>
  );
}
