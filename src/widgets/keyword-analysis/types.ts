import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

/** 버블 클라우드와 중요도 차트가 공유하는 활성 키워드 변경 콜백입니다. */
export type KeywordHoverChangeHandler = (keyword: string | null) => void;

/** 키워드 분석 시각화가 공유하는 데이터와 연동 호버 props입니다. */
export interface KeywordAnalysisVisualizationProps {
  activeKeyword?: string | null;
  keywords: KeywordAnalysisKeyword[];
  onKeywordHoverChange?: KeywordHoverChangeHandler;
}
