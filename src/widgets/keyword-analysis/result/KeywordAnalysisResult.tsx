'use client';

import { useMemo, useState } from 'react';

import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';
import { MOCK_KEYWORD_ANALYSIS_KEYWORDS } from '@/shared/mocks';
import { Title } from '@/shared/ui/title';

import { KeywordBubbleCloud } from '../bubble-cloud/KeywordBubbleCloud';
import { KeywordImportanceChart } from '../importance-chart/KeywordImportanceChart';
import {
  createKeywordAnalysisSignature,
  limitKeywordAnalysisKeywords,
} from '../utils/keywordCollection';

interface KeywordAnalysisResultProps {
  keywords?: KeywordAnalysisKeyword[];
}

interface KeywordHoverState {
  activeKeyword: string | null;
  keywordSignature: string;
}

/**
 * 자기소개서에서 추출한 핵심 키워드를 버블 클라우드와 중요도 차트로 표시합니다.
 *
 * @remarks
 * 현재는 결과 API 연동 전이므로 목 키워드 데이터를 사용합니다.
 * 동일한 데이터를 두 시각화에 전달해 키워드별 중요도를 서로 다른 방식으로 확인할 수 있습니다.
 */
export function KeywordAnalysisResult({
  keywords = MOCK_KEYWORD_ANALYSIS_KEYWORDS,
}: KeywordAnalysisResultProps) {
  const limitedKeywords = useMemo(() => limitKeywordAnalysisKeywords(keywords), [keywords]);
  const keywordSignature = createKeywordAnalysisSignature(limitedKeywords);
  const [hoverState, setHoverState] = useState<KeywordHoverState>({
    activeKeyword: null,
    keywordSignature,
  });
  const activeKeyword =
    hoverState.keywordSignature === keywordSignature ? hoverState.activeKeyword : null;
  const handleKeywordHoverChange = (nextKeyword: string | null) => {
    setHoverState({ activeKeyword: nextKeyword, keywordSignature });
  };
  const handleMouseLeave = () => handleKeywordHoverChange(null);

  return (
    <section
      aria-labelledby="keyword-analysis-result-title"
      className="mt-9 grid w-full max-w-260 grid-cols-1 gap-3 rounded-2xl border border-white/6 bg-gray-800/70 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-4 lg:grid-cols-2"
      onMouseLeave={handleMouseLeave}
    >
      <Title as="h2" className="sr-only" id="keyword-analysis-result-title">
        핵심 키워드 분석 결과
      </Title>

      <KeywordBubbleCloud
        activeKeyword={activeKeyword}
        keywords={limitedKeywords}
        onKeywordHoverChange={handleKeywordHoverChange}
      />
      <KeywordImportanceChart
        activeKeyword={activeKeyword}
        keywords={limitedKeywords}
        onKeywordHoverChange={handleKeywordHoverChange}
      />
    </section>
  );
}
