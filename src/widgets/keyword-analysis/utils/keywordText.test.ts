import { getKeywordTextWidthUnits, truncateKeywordByWidth } from './keywordText';

describe('getKeywordTextWidthUnits', () => {
  it('한글보다 폭이 좁은 영문은 더 작은 너비 단위로 계산한다', () => {
    expect(getKeywordTextWidthUnits('React')).toBeLessThan(getKeywordTextWidthUnits('리액트개발'));
  });
});

describe('truncateKeywordByWidth', () => {
  it('허용 너비 안에 있는 키워드는 그대로 반환한다', () => {
    expect(truncateKeywordByWidth('TypeScript', 7)).toBe('TypeScript');
  });

  it('허용 너비를 초과하는 키워드는 말줄임표를 포함해 줄인다', () => {
    expect(truncateKeywordByWidth('사용자경험분석', 6)).toBe('사용자경험…');
  });
});
