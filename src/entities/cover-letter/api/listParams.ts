import type { ListCoverLettersParams } from './types';

export const COVER_LETTER_LIST_DEFAULT_PAGE = 1;
export const COVER_LETTER_LIST_PAGE_SIZE = 6;

/** URL에서 결정한 페이지 번호와 PRD의 카드 수를 목록 요청에 동일하게 적용합니다. */
export const getCoverLetterListParams = (
  requestedPage = COVER_LETTER_LIST_DEFAULT_PAGE
): Required<ListCoverLettersParams> => ({
  page:
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : COVER_LETTER_LIST_DEFAULT_PAGE,
  size: COVER_LETTER_LIST_PAGE_SIZE,
});
