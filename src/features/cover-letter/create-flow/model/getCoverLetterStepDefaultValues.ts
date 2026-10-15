import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import type {
  CoverLetterStep1FormInput,
  CoverLetterStep2FormInput,
  CoverLetterStep3FormInput,
} from './schemas/coverLetterCreateSchemas';

/** 서버 기본 정보를 입력 폼과 단계 진입 검증에서 사용하는 값으로 변환합니다. */
export function getCoverLetterStep1DefaultValues(
  draft?: CoverLetterDetailResponse | null
): CoverLetterStep1FormInput {
  return {
    title: draft?.coverLetter.title ?? '',
    companyName: draft?.coverLetter.companyName ?? '',
    positionTitle: draft?.coverLetter.positionTitle ?? '',
    jobPostingUrl: draft?.coverLetter.jobPostingUrl ?? '',
  };
}

/** API의 preferences를 우대사항 폼 필드명으로 변환합니다. */
export function getCoverLetterStep2DefaultValues(
  draft?: CoverLetterDetailResponse | null
): CoverLetterStep2FormInput {
  return { preferredQualification: draft?.coverLetter.preferences ?? '' };
}

/** 문항을 서버 순서로 정렬하고 답변 필드명·글자 수를 입력 폼 형식으로 변환합니다. */
export function getCoverLetterStep3DefaultValues(
  draft?: CoverLetterDetailResponse | null
): CoverLetterStep3FormInput {
  return {
    questions: [...(draft?.questions ?? [])]
      .sort((first, second) => first.order - second.order)
      .map((question) => ({
        question: question.question ?? '',
        answer: question.originalAnswer ?? '',
        characterLimit: question.maxAnswerLength?.toString() ?? '',
      })),
  };
}
