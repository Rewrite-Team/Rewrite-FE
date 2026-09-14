'use client';

import { useId, useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT,
  KEYWORD_ANALYSIS_VISUALIZATION_PANEL_CLASS_NAME,
} from '../constants';
import { truncateKeywordByWidth } from '../utils/keywordText';

import type { KeywordAnalysisVisualizationProps } from '../types';
import type { MouseHandlerDataParam } from 'recharts';

interface KeywordAxisTickProps {
  activeKeyword?: string | null;
  payload?: {
    value: string;
  };
  x?: number;
  y?: number;
}

const KEYWORD_LABEL_MAX_WIDTH_UNITS = 7;

const formatKeywordLabel = (keyword: string) =>
  truncateKeywordByWidth(keyword, KEYWORD_LABEL_MAX_WIDTH_UNITS);

/** 키워드를 너비 기준으로 줄여 한 줄짜리 SVG 축 라벨로 표시합니다. */
function KeywordAxisTick({ activeKeyword = null, payload, x = 0, y = 0 }: KeywordAxisTickProps) {
  if (!payload) return null;

  const isHighlighted = activeKeyword === payload.value;
  const isDimmed = activeKeyword !== null && !isHighlighted;

  return (
    <text
      className="transition-[fill,opacity,filter,font-size] duration-200"
      dominantBaseline="central"
      fill={isHighlighted ? 'var(--color-primary-100)' : 'var(--color-gray-100)'}
      fontSize={isHighlighted ? '11' : '10'}
      fontWeight={isHighlighted ? '600' : '500'}
      opacity={isDimmed ? 0.45 : 1}
      style={{
        filter: isHighlighted ? 'drop-shadow(0 0 4px rgba(118, 186, 255, 0.45))' : undefined,
      }}
      textAnchor="end"
      x={x}
      y={y}
    >
      {formatKeywordLabel(payload.value)}
    </text>
  );
}

/**
 * 키워드별 중요도를 내림차순 가로 막대 차트로 표시합니다.
 *
 * @remarks
 * 긴 축 라벨은 말줄임 처리하며 Recharts Tooltip에서는 전체 키워드와 중요도를 제공합니다.
 * 차트 애니메이션은 서버 렌더링과 사용자의 모션 감소 설정을 고려하는 Recharts의 자동 모드를 사용합니다.
 */
export function KeywordImportanceChart({
  activeKeyword = null,
  keywords,
  onKeywordHoverChange,
}: KeywordAnalysisVisualizationProps) {
  const chartId = useId();
  const gradientId = `${chartId}-bar-gradient`;
  const importanceData = useMemo(
    () => [...keywords].sort((first, second) => second.importance - first.importance),
    [keywords]
  );
  const handleChartMouseMove = ({ activeLabel, isTooltipActive }: MouseHandlerDataParam) => {
    const keyword = isTooltipActive && typeof activeLabel === 'string' ? activeLabel : null;

    onKeywordHoverChange?.(keyword);
  };
  const handleChartMouseLeave = () => onKeywordHoverChange?.(null);

  return (
    <section
      aria-labelledby={`${chartId}-title`}
      className={KEYWORD_ANALYSIS_VISUALIZATION_PANEL_CLASS_NAME}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(118,186,255,0.1),transparent_34%)]"
      />

      <header className="absolute inset-x-4 top-3 z-(--z-index-local-overlay) flex items-center">
        <h3 className="body-14 font-semibold text-gray-50" id={`${chartId}-title`}>
          키워드 TOP{KEYWORD_ANALYSIS_MAX_KEYWORD_COUNT}
        </h3>
      </header>

      <div className="absolute inset-x-2 top-12 bottom-2 sm:inset-x-3">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer
            barCategoryGap="20%"
            data={importanceData}
            layout="vertical"
            margin={{ bottom: 0, left: 2, right: 8, top: 0 }}
            onMouseLeave={handleChartMouseLeave}
            onMouseMove={handleChartMouseMove}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--color-primary-800)" />
                <stop offset="55%" stopColor="var(--color-primary-600)" />
                <stop offset="100%" stopColor="var(--color-primary-400)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              stroke="var(--color-primary-900)"
              strokeDasharray="2 6"
              strokeOpacity={0.35}
              vertical
              verticalValues={[0, 25, 50, 75]}
            />
            <XAxis
              axisLine={{ stroke: 'var(--color-primary-900)' }}
              domain={[0, 100]}
              height={14}
              tick={{ fill: 'var(--color-gray-400)', fontFamily: 'monospace', fontSize: 8 }}
              tickLine={false}
              ticks={[0, 25, 50, 75, 100]}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="keyword"
              interval={0}
              tick={<KeywordAxisTick activeKeyword={activeKeyword} />}
              tickLine={false}
              type="category"
              width={82}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'color-mix(in srgb, var(--color-gray-800) 96%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-primary-300) 15%, transparent)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                color: 'var(--color-gray-100)',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(118, 186, 255, 0.065)' }}
              isAnimationActive="auto"
              itemStyle={{ color: 'var(--color-primary-300)', padding: 0 }}
              labelStyle={{ color: 'var(--color-white)', fontWeight: 600, marginBottom: '2px' }}
              trigger="hover"
            />
            <Bar
              activeBar={{ fill: 'var(--color-primary-600)' }}
              animationDuration={520}
              animationEasing="ease-out"
              background={{
                fill: 'var(--color-gray-800)',
                radius: 5,
              }}
              dataKey="importance"
              fill={`url(#${gradientId})`}
              isAnimationActive="auto"
              maxBarSize={9}
              name="중요도"
              radius={[0, 5, 5, 0]}
              unit="%"
            >
              {importanceData.map(({ keyword }) => {
                const isHovered = activeKeyword === keyword;
                const hasActiveKeyword = activeKeyword !== null;

                return (
                  <Cell
                    fill={`url(#${gradientId})`}
                    fillOpacity={hasActiveKeyword && !isHovered ? 0.32 : 1}
                    key={keyword}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="sr-only">
        {importanceData.map(({ importance, keyword }) => (
          <li key={keyword}>
            {keyword}, 중요도 {importance}%
          </li>
        ))}
      </ul>
    </section>
  );
}
