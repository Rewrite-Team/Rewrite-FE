const KEYWORD_WIDTH_TOLERANCE = 0.02;

/**
 * 문자 종류별 예상 너비를 합산해 키워드 라벨의 상대 너비를 계산합니다.
 *
 * @remarks
 * 공백은 0.35, ASCII 문자는 0.58, 그 외 문자는 1 너비 단위로 계산합니다.
 * 브라우저의 실제 폰트 측정 없이 서버와 클라이언트에서 동일한 결과를 만들기 위한 근삿값입니다.
 *
 * @param keyword - 예상 너비를 계산할 키워드입니다.
 * @returns 키워드의 상대 너비 단위입니다.
 */
export const getKeywordTextWidthUnits = (keyword: string) =>
  Array.from(keyword).reduce((width, character) => {
    if (/\s/.test(character)) return width + 0.35;
    if (/^[\u0020-\u007e]$/.test(character)) return width + 0.58;

    return width + 1;
  }, 0);

/**
 * 키워드가 허용 너비를 초과하면 표시 가능한 마지막 문자 뒤에 말줄임표를 붙입니다.
 *
 * @param keyword - 표시할 키워드입니다.
 * @param maxWidthUnits - 말줄임 없이 사용할 수 있는 최대 상대 너비입니다.
 * @returns 허용 너비 안에 들어오도록 줄인 키워드입니다.
 */
export const truncateKeywordByWidth = (keyword: string, maxWidthUnits: number) => {
  if (getKeywordTextWidthUnits(keyword) <= maxWidthUnits + KEYWORD_WIDTH_TOLERANCE) return keyword;

  const ellipsis = '…';
  let displayKeyword = '';

  for (const character of Array.from(keyword)) {
    if (
      getKeywordTextWidthUnits(`${displayKeyword}${character}${ellipsis}`) >
      maxWidthUnits + KEYWORD_WIDTH_TOLERANCE
    )
      break;
    displayKeyword += character;
  }

  return `${displayKeyword.trimEnd()}${ellipsis}`;
};
