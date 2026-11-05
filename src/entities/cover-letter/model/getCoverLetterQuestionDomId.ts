/** 문항 번호에 대응하는 자기소개서 문항 DOM ID를 반환합니다. */
export const getCoverLetterQuestionDomId = (questionNumber: number) =>
  `cover-letter-question-${questionNumber}`;
