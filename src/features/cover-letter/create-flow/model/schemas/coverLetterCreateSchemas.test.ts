import { INPUT_LIMITS } from '@/shared/constants/limits';

import {
  coverLetterStep1Schema,
  coverLetterStep2Schema,
  coverLetterStep3Schema,
  coverLetterStep4Schema,
} from './coverLetterCreateSchemas';

const VALID_STEP1_INPUT = {
  companyName: ' 카카오 ',
  jobPostingUrl: ' https://careers.kakao.com/jobs/frontend ',
  positionTitle: ' 프론트엔드 개발자 ',
  title: ' 카카오 자기소개서 ',
};

const VALID_STEP2_INPUT = {
  preferredQualification: ' React와 TypeScript 기반 개발 경험 ',
};

const VALID_STEP3_INPUT = {
  questions: [
    {
      answer: ' 사용자 경험을 개선한 경험입니다. ',
      characterLimit: '700',
      question: ' 지원 동기를 작성해주세요. ',
    },
  ],
};

describe('coverLetterCreateSchemas', () => {
  it('STEP1 문자열을 trim하고 선택 URL을 검증한다', () => {
    expect(coverLetterStep1Schema.parse(VALID_STEP1_INPUT)).toEqual({
      companyName: '카카오',
      jobPostingUrl: 'https://careers.kakao.com/jobs/frontend',
      positionTitle: '프론트엔드 개발자',
      title: '카카오 자기소개서',
    });

    expect(
      coverLetterStep1Schema.safeParse({ ...VALID_STEP1_INPUT, jobPostingUrl: '' }).success
    ).toBe(true);
    expect(
      coverLetterStep1Schema.safeParse({ ...VALID_STEP1_INPUT, jobPostingUrl: 'invalid-url' })
        .success
    ).toBe(false);
  });

  it('STEP1 필수값과 최대 길이를 검증한다', () => {
    expect(coverLetterStep1Schema.safeParse({ ...VALID_STEP1_INPUT, title: '   ' }).success).toBe(
      false
    );
    expect(
      coverLetterStep1Schema.safeParse({
        ...VALID_STEP1_INPUT,
        title: '가'.repeat(INPUT_LIMITS.COVER_LETTER_TITLE + 1),
      }).success
    ).toBe(false);
  });

  it('STEP2 우대사항의 공백 입력을 거부한다', () => {
    expect(coverLetterStep2Schema.parse(VALID_STEP2_INPUT)).toEqual({
      preferredQualification: 'React와 TypeScript 기반 개발 경험',
    });
    expect(coverLetterStep2Schema.safeParse({ preferredQualification: '   ' }).success).toBe(false);
  });

  it('STEP3 글자 수를 숫자로 변환하고 빈 값은 undefined로 처리한다', () => {
    expect(coverLetterStep3Schema.parse(VALID_STEP3_INPUT).questions[0].characterLimit).toBe(700);
    expect(
      coverLetterStep3Schema.parse({
        questions: [{ ...VALID_STEP3_INPUT.questions[0], characterLimit: '' }],
      }).questions[0].characterLimit
    ).toBeUndefined();
    expect(
      coverLetterStep3Schema.safeParse({
        questions: [{ ...VALID_STEP3_INPUT.questions[0], characterLimit: '0' }],
      }).success
    ).toBe(false);
  });

  it('STEP3은 한 개 이상의 완성된 문항을 요구한다', () => {
    expect(coverLetterStep3Schema.safeParse({ questions: [] }).success).toBe(false);
    expect(
      coverLetterStep3Schema.safeParse({
        questions: [{ answer: '답변', characterLimit: '', question: '   ' }],
      }).success
    ).toBe(false);
  });

  it('STEP4에서 STEP1~3 전체 입력을 함께 검증한다', () => {
    const result = coverLetterStep4Schema.parse({
      ...VALID_STEP1_INPUT,
      ...VALID_STEP2_INPUT,
      ...VALID_STEP3_INPUT,
    });

    expect(result.title).toBe('카카오 자기소개서');
    expect(result.preferredQualification).toBe('React와 TypeScript 기반 개발 경험');
    expect(result.questions[0].characterLimit).toBe(700);
  });
});
