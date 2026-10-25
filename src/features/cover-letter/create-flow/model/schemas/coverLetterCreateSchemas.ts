import { z } from 'zod';

import { INPUT_LIMITS } from '@/shared/constants/limits';

const createRequiredTextSchema = (requiredMessage: string, maxLength?: number) => {
  const schema = z.string({ error: requiredMessage }).trim().min(1, { message: requiredMessage });

  return maxLength === undefined
    ? schema
    : schema.max(maxLength, { message: `최대 ${maxLength}자까지 입력할 수 있습니다.` });
};

const httpUrlSchema = z.httpUrl();

const optionalJobPostingUrlSchema = z
  .string()
  .trim()
  .max(INPUT_LIMITS.COVER_LETTER_JOB_POSTING_URL, {
    message: `최대 ${INPUT_LIMITS.COVER_LETTER_JOB_POSTING_URL}자까지 입력할 수 있습니다.`,
  })
  .refine((value) => value.length === 0 || httpUrlSchema.safeParse(value).success, {
    message: '올바른 HTTP(S) URL을 입력해주세요.',
  });

const characterLimitSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      const parsedValue = Number(value);

      return (
        value.length === 0 ||
        (/^\d+$/.test(value) &&
          Number.isSafeInteger(parsedValue) &&
          parsedValue >= INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MIN &&
          parsedValue <= INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MAX)
      );
    },
    {
      message: `글자 수는 ${INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MIN} 이상 ${INPUT_LIMITS.COVER_LETTER_CHARACTER_LIMIT_MAX} 이하의 정수로 입력해주세요.`,
    }
  )
  .transform((value) => (value.length === 0 ? undefined : Number(value)));

/** STEP1 자기소개서 기본 정보 검증 스키마입니다. */
export const coverLetterStep1Schema = z.object({
  companyName: createRequiredTextSchema(
    '회사명을 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_COMPANY_NAME
  ),
  jobPostingUrl: optionalJobPostingUrlSchema,
  positionTitle: createRequiredTextSchema(
    '희망 직무를 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_POSITION_TITLE
  ),
  title: createRequiredTextSchema(
    '자기소개서 제목을 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_TITLE
  ),
});

/** STEP2 채용 공고 우대사항 검증 스키마입니다. */
export const coverLetterStep2Schema = z.object({
  preferredQualification: createRequiredTextSchema(
    '공고 우대사항을 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_PREFERENCES
  ),
});

/** STEP3의 문항 하나를 검증하는 스키마입니다. */
export const coverLetterQuestionSchema = z.object({
  answer: createRequiredTextSchema(
    '자기소개서 내용을 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_ANSWER
  ),
  characterLimit: characterLimitSchema,
  question: createRequiredTextSchema(
    '자기소개서 질문을 입력해주세요.',
    INPUT_LIMITS.COVER_LETTER_QUESTION
  ),
});

/** STEP3 자기소개서 문항 목록 검증 스키마입니다. */
export const coverLetterStep3Schema = z.object({
  questions: z
    .array(coverLetterQuestionSchema)
    .min(1, { message: '자기소개서 문항을 1개 이상 작성해주세요.' }),
});

export type CoverLetterStep1FormInput = z.input<typeof coverLetterStep1Schema>;
export type CoverLetterStep1Values = z.output<typeof coverLetterStep1Schema>;
export type CoverLetterStep2FormInput = z.input<typeof coverLetterStep2Schema>;
export type CoverLetterStep2Values = z.output<typeof coverLetterStep2Schema>;
export type CoverLetterStep3FormInput = z.input<typeof coverLetterStep3Schema>;
export type CoverLetterStep3Values = z.output<typeof coverLetterStep3Schema>;
