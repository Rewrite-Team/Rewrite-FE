import type { ReactNode } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { KeywordImportanceChart } from './KeywordImportanceChart';

interface MockChartContainerProps {
  children?: ReactNode;
}

interface MockBarChartProps extends MockChartContainerProps {
  onMouseLeave?: () => void;
  onMouseMove?: (state: { activeLabel: string; isTooltipActive: boolean }) => void;
}

jest.mock('recharts', () => ({
  Bar: ({ children }: MockChartContainerProps) => <>{children}</>,
  BarChart: ({ children, onMouseLeave, onMouseMove }: MockBarChartProps) => (
    <div
      data-testid="recharts-bar-chart"
      onMouseLeave={onMouseLeave}
      onMouseMove={() => onMouseMove?.({ activeLabel: 'React', isTooltipActive: true })}
    >
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: MockChartContainerProps) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const KEYWORDS = [
  { frequency: 10, importance: 95, keyword: 'React' },
  { frequency: 8, importance: 80, keyword: 'TypeScript' },
];

describe('KeywordImportanceChart', () => {
  it('막대 길이와 관계없이 활성 행의 키워드를 전달하고 이탈 시 초기화한다', () => {
    const handleKeywordHoverChange = jest.fn();

    render(
      <KeywordImportanceChart keywords={KEYWORDS} onKeywordHoverChange={handleKeywordHoverChange} />
    );

    const chart = screen.getByTestId('recharts-bar-chart');

    fireEvent.mouseMove(chart);
    expect(handleKeywordHoverChange).toHaveBeenLastCalledWith('React');

    fireEvent.mouseLeave(chart);
    expect(handleKeywordHoverChange).toHaveBeenLastCalledWith(null);
  });

  it('클릭만으로 활성 키워드를 변경하지 않는다', () => {
    const handleKeywordHoverChange = jest.fn();

    render(
      <KeywordImportanceChart keywords={KEYWORDS} onKeywordHoverChange={handleKeywordHoverChange} />
    );

    fireEvent.click(screen.getByTestId('recharts-bar-chart'));

    expect(handleKeywordHoverChange).not.toHaveBeenCalled();
  });
});
