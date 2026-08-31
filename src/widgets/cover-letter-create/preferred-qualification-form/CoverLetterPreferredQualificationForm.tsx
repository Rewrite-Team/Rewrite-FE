'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  coverLetterStep2Schema,
  type CoverLetterStep2FormInput,
  type CoverLetterStep2Values,
} from '@/features/cover-letter/create-flow';
import { ROUTES } from '@/shared/constants/routes';
import { FormField } from '@/shared/ui/form-field';
import { TextArea } from '@/shared/ui/textarea';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

/**
 * ## CoverLetterPreferredQualificationForm
 *
 * @description
 * 자기소개서 등록 STEP2에서 채용 공고의 우대사항을 입력하는 폼입니다.
 * 스키마 도입 전까지 필수 입력 여부만 검증하며 서버 저장은 수행하지 않습니다.
 */
export function CoverLetterPreferredQualificationForm() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<
    CoverLetterStep2FormInput,
    unknown,
    CoverLetterStep2Values
  >({
    defaultValues: {
      preferredQualification: '',
    },
    resolver: zodResolver(coverLetterStep2Schema),
  });

  const handleValidSubmit: SubmitHandler<CoverLetterStep2Values> = () => {
    // TODO: 우대사항 저장 API가 연결되면 저장 성공 후 STEP3으로 이동한다.
    router.push(ROUTES.WRITING_CREATE_STEP(3));
  };

  return (
    <form
      aria-label="채용 공고 우대사항"
      id={COVER_LETTER_STEP_FORM_ID}
      noValidate
      onSubmit={handleSubmit(handleValidSubmit)}
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
