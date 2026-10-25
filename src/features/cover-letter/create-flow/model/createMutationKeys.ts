/** 같은 자기소개서의 단계별 저장과 최종 제출을 함께 구독하는 mutation 키입니다. */
export const getCoverLetterCreateMutationKey = (coverLetterId: string) =>
  ['cover-letter-create', coverLetterId] as const;
