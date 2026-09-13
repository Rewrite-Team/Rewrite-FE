import { fireEvent, render, screen } from '@testing-library/react';

import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import { KeywordAnalysisResult } from './KeywordAnalysisResult';
import { KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT } from '../constants';

import type { KeywordAnalysisVisualizationProps } from '../types';

jest.mock('../bubble-cloud/KeywordBubbleCloud', () => ({
  KeywordBubbleCloud: ({
    activeKeyword,
    keywords,
    onKeywordHoverChange,
  }: KeywordAnalysisVisualizationProps) => (
    <button
      data-active-keyword={activeKeyword ?? ''}
      data-keyword-count={keywords.length}
      data-testid="keyword-bubble-cloud"
      onMouseEnter={() => onKeywordHoverChange?.(keywords[0]?.keyword ?? null)}
      onMouseLeave={() => onKeywordHoverChange?.(null)}
      type="button"
    >
      버블 클라우드
    </button>
  ),
}));

jest.mock('../importance-chart/KeywordImportanceChart', () => ({
  KeywordImportanceChart: ({
    activeKeyword,
    keywords,
    onKeywordHoverChange,
  }: KeywordAnalysisVisualizationProps) => (
    <button
      data-active-keyword={activeKeyword ?? ''}
      data-keyword-count={keywords.length}
      data-testid="keyword-importance-chart"
      onMouseEnter={() => onKeywordHoverChange?.(keywords[0]?.keyword ?? null)}
      onMouseLeave={() => onKeywordHoverChange?.(null)}
      type="button"
    >
      중요도 차트
    </button>
  ),
}));

const INITIAL_KEYWORDS: KeywordAnalysisKeyword[] = [
  { frequency: 10, importance: 95, keyword: 'React' },
  { frequency: 8, importance: 80, keyword: 'TypeScript' },
];

const UPDATED_KEYWORDS: KeywordAnalysisKeyword[] = [
  { frequency: 9, importance: 92, keyword: '접근성' },
];

describe('KeywordAnalysisResult', () => {
  it('한 시각화에서 호버한 키워드를 다른 시각화에도 전달하고 이탈 시 초기화한다', () => {
    render(<KeywordAnalysisResult keywords={INITIAL_KEYWORDS} />);

    const bubbleCloud = screen.getByTestId('keyword-bubble-cloud');
    const importanceChart = screen.getByTestId('keyword-importance-chart');

    fireEvent.mouseEnter(importanceChart);

    expect(importanceChart).toHaveAttribute('data-active-keyword', 'React');
    expect(bubbleCloud).toHaveAttribute('data-active-keyword', 'React');

    fireEvent.mouseLeave(importanceChart);

    expect(importanceChart).toHaveAttribute('data-active-keyword', '');
    expect(bubbleCloud).toHaveAttribute('data-active-keyword', '');
  });

  it('키워드 분석 결과가 교체되면 이전 활성 키워드를 초기화한다', () => {
    const { rerender } = render(<KeywordAnalysisResult keywords={INITIAL_KEYWORDS} />);
    const importanceChart = screen.getByTestId('keyword-importance-chart');

    fireEvent.mouseEnter(importanceChart);
    expect(screen.getByTestId('keyword-bubble-cloud')).toHaveAttribute(
      'data-active-keyword',
      'React'
    );

    rerender(<KeywordAnalysisResult keywords={UPDATED_KEYWORDS} />);

    expect(screen.getByTestId('keyword-importance-chart')).toHaveAttribute(
      'data-active-keyword',
      ''
    );
    expect(screen.getByTestId('keyword-bubble-cloud')).toHaveAttribute('data-active-keyword', '');
  });

  it('두 시각화에 동일한 최대 개수의 키워드를 전달한다', () => {
    const keywords = Array.from({ length: KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT + 1 }, (_, index) => ({
      frequency: index + 1,
      importance: 100 - index,
      keyword: `키워드 ${index + 1}`,
    }));

    render(<KeywordAnalysisResult keywords={keywords} />);

    expect(screen.getByTestId('keyword-bubble-cloud')).toHaveAttribute(
      'data-keyword-count',
      String(KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT)
    );
    expect(screen.getByTestId('keyword-importance-chart')).toHaveAttribute(
      'data-keyword-count',
      String(KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT)
    );
  });
});
