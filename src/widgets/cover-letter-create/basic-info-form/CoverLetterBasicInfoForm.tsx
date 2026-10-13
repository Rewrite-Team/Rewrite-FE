'use client';

import { useRef, type SubmitEvent } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  coverLetterStep1Schema,
  type CoverLetterStep1FormInput,
  type CoverLetterStep1Values,
  useCoverLetterCreateDraft,
  useSaveCoverLetterBasicInfo,
} from '@/features/cover-letter/create-flow';
import { ApiError } from '@/shared/api';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

/**
 * 자기소개서 등록 STEP1의 제목과 지원 회사·직무 정보를 입력하는 폼입니다.
 * 미완성 입력은 임시 저장하고, 다음 단계 이동은 필수값 검증과 저장 후 수행합니다.
 */
export function CoverLetterBasicInfoForm() {
  const router = useRouter();
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const draft = useCoverLetterCreateDraft();
  const saveMutation = useSaveCoverLetterBasicInfo(coverLetterId);
  const savingRef = useRef(false);
  const { control, getValues, handleSubmit, setError, clearErrors } = useForm<
    CoverLetterStep1FormInput,
    unknown,
    CoverLetterStep1Values
  >({
    defaultValues: {
      companyName: draft?.coverLetter.companyName ?? '',
      jobPostingUrl: draft?.coverLetter.jobPostingUrl ?? '',
      positionTitle: draft?.coverLetter.positionTitle ?? '',
      title: draft?.coverLetter.title ?? '',
    },
    resolver: zodResolver(coverLetterStep1Schema),
  });

  const saveBasicInfo = async (values: CoverLetterStep1FormInput, moveToNext: boolean) => {
    if (savingRef.current) return;
    savingRef.current = true;
    clearErrors();

    try {
      await saveMutation.mutateAsync({
        title: values.title.trim() || null,
        companyName: values.companyName.trim() || null,
        positionTitle: values.positionTitle.trim() || null,
        jobPostingUrl: values.jobPostingUrl.trim() || null,
      });
      if (moveToNext) {
        router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, 2));
      } else {
        appToast.success('임시 저장되었습니다.');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        for (const detail of error.details) {
          const field = detail.field;
          if (
            field === 'title' ||
            field === 'companyName' ||
            field === 'positionTitle' ||
            field === 'jobPostingUrl'
          ) {
            setError(field, {
              type: 'server',
              message: detail.reason ?? '입력값을 확인해 주세요.',
            });
          }
        }
      }
      appToast.error('기본 정보를 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.');
    } finally {
      savingRef.current = false;
    }
  };

  const handleValidSubmit: SubmitHandler<CoverLetterStep1Values> = (values) =>
    saveBasicInfo(values, true);

  const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const submitter = event.nativeEvent.submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === 'save-draft') {
      event.preventDefault();
      void saveBasicInfo(getValues(), false);
      return;
    }
    void handleSubmit(handleValidSubmit)(event);
  };

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
