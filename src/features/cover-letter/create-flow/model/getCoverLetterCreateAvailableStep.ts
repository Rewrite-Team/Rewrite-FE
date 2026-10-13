import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import {
  coverLetterStep1Schema,
  coverLetterStep2Schema,
  coverLetterStep3Schema,
} from './schemas/coverLetterCreateSchemas';

import type { WritingCreateStep } from './writingCreateStep';

/** 서버에 저장된 입력값을 기준으로 처음 작성해야 하는 단계까지 진입을 허용합니다. */
export function getCoverLetterCreateAvailableStep(
  draft: CoverLetterDetailResponse
): WritingCreateStep {
  const { coverLetter, questions } = draft;
  if (
    !coverLetterStep1Schema.safeParse({
      title: coverLetter.title ?? '',
      companyName: coverLetter.companyName ?? '',
      positionTitle: coverLetter.positionTitle ?? '',
      jobPostingUrl: coverLetter.jobPostingUrl ?? '',
    }).success
  )
    return 1;

  if (
    !coverLetterStep2Schema.safeParse({ preferredQualification: coverLetter.preferences ?? '' })
      .success
  )
    return 2;

  if (
    !coverLetterStep3Schema.safeParse({
      questions: questions.map((question) => ({
        question: question.question ?? '',
        answer: question.originalAnswer ?? '',
        characterLimit: question.maxAnswerLength?.toString() ?? '',
      })),
    }).success
  )
    return 3;

  return 4;
}
