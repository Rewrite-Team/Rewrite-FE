import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import { KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT } from '../constants';

/** 분석 결과에서 화면에 표시할 최대 개수의 키워드만 반환합니다. */
export const limitKeywordAnalysisKeywords = (keywords: KeywordAnalysisKeyword[]) =>
  keywords.slice(0, KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT);

/** 키워드 분석 데이터의 변경 여부를 비교할 수 있는 안정적인 문자열을 생성합니다. */
export const createKeywordAnalysisSignature = (keywords: KeywordAnalysisKeyword[]) =>
  JSON.stringify(
    keywords.map(({ frequency, importance, keyword }) => [keyword, frequency, importance])
  );
