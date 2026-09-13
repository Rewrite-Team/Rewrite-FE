import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import { KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT } from '../constants';
import { createKeywordAnalysisSignature, limitKeywordAnalysisKeywords } from './keywordCollection';

const createKeyword = (index: number): KeywordAnalysisKeyword => ({
  frequency: index + 1,
  importance: 100 - index,
  keyword: `키워드 ${index + 1}`,
});

describe('limitKeywordAnalysisKeywords', () => {
  it('입력 순서를 유지하면서 최대 키워드 개수만 반환한다', () => {
    const keywords = Array.from({ length: KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT + 1 }, (_, index) =>
      createKeyword(index)
    );

    expect(limitKeywordAnalysisKeywords(keywords)).toEqual(
      keywords.slice(0, KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT)
    );
  });
});

describe('createKeywordAnalysisSignature', () => {
  it('키워드, 빈도와 중요도가 같으면 동일한 시그니처를 생성한다', () => {
    const keywords = [createKeyword(0), createKeyword(1)];

    expect(createKeywordAnalysisSignature(keywords)).toBe(
      createKeywordAnalysisSignature(keywords.map((keyword) => ({ ...keyword })))
    );
  });

  it('구분자 문자가 포함된 키워드도 충돌 없이 구분한다', () => {
    const firstKeywords = [{ frequency: 1, importance: 1, keyword: 'A|B:C' }];
    const secondKeywords = [{ frequency: 1, importance: 1, keyword: 'A|B' }];

    expect(createKeywordAnalysisSignature(firstKeywords)).not.toBe(
      createKeywordAnalysisSignature(secondKeywords)
    );
  });
});
