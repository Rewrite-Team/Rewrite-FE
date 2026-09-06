'use client';

import '@/shared/styles/components/keyword-bubble.css';

import { useId } from 'react';

import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import {
  KEYWORD_BUBBLE_ENTRY_STAGGER_MS,
  KEYWORD_BUBBLE_LABEL_LINE_HEIGHT_RATIO,
  KEYWORD_BUBBLE_VIEWBOX,
} from './constants';
import { useKeywordBubbleCloud } from './hooks/useKeywordBubbleCloud';
import { KeywordBubbleTooltip } from './KeywordBubbleTooltip';

interface KeywordBubbleCloudProps {
  keywords: KeywordAnalysisKeyword[];
}

/**
 * 키워드 분석 결과를 물리 기반의 SVG 버블 클라우드로 표시합니다.
 *
 * @remarks
 * 최대 20개의 키워드에 충돌과 중심 force를 적용해 튕긴 뒤 정착하는 애니메이션을 제공합니다.
 * 사용자는 각 버블을 드래그하거나 호버해 중요도를 확인할 수 있습니다.
 * 운영체제의 모션 감소 설정이 켜져 있으면 시뮬레이션을 즉시 완료합니다.
 * 시각적 SVG는 보조 기술에서 숨기고 동일한 정보를 텍스트 목록으로 제공합니다.
 */
export function KeywordBubbleCloud({ keywords }: KeywordBubbleCloudProps) {
  const shadowFilterId = useId();
  const {
    activeTooltip,
    bubbleNodes,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    handlePointerRelease,
    isEntryAnimationActive,
    registerBubbleElement,
    svgRef,
  } = useKeywordBubbleCloud(keywords);

  return (
    <div className="relative aspect-4/3 min-h-72 overflow-hidden rounded-xl border border-primary-300/10 bg-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(118,186,255,0.11),transparent_34%),radial-gradient(circle_at_78%_74%,rgba(84,132,181,0.08),transparent_36%)]"
      />
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full select-none"
        preserveAspectRatio="xMidYMid meet"
        ref={svgRef}
        viewBox={`0 0 ${KEYWORD_BUBBLE_VIEWBOX.width} ${KEYWORD_BUBBLE_VIEWBOX.height}`}
      >
        <defs>
          <filter id={shadowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" floodColor="#000000" floodOpacity="0.24" stdDeviation="6" />
          </filter>
        </defs>
        {bubbleNodes.map(
          ({ displayLines, fill, fontSize, id, radius, stroke, textColor, x, y }, index) => (
            <g
              className="group cursor-grab touch-none active:cursor-grabbing"
              data-bubble-id={id}
              key={id}
              onLostPointerCapture={handlePointerRelease}
              onPointerCancel={handlePointerRelease}
              onPointerDown={handlePointerDown}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerRelease}
              ref={(element) => registerBubbleElement(id, element)}
              transform={`translate(${x}, ${y})`}
            >
              <g
                className={isEntryAnimationActive ? 'keyword-bubble-pop' : 'keyword-bubble'}
                style={{
                  animationDelay: `${index * KEYWORD_BUBBLE_ENTRY_STAGGER_MS}ms`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
              >
                <circle
                  className="transition-[stroke-width,filter] duration-200 group-hover:stroke-[2px]"
                  fill={fill}
                  filter={`url(#${shadowFilterId})`}
                  r={radius}
                  stroke={stroke}
                  strokeOpacity="0.82"
                  strokeWidth="1.25"
                />
                <circle fill="none" r={radius - 2} stroke="white" strokeOpacity="0.035" />
                <text
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={fontSize}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {displayLines.map((line, lineIndex) => (
                    <tspan
                      key={`${id}-${lineIndex}`}
                      x="0"
                      y={
                        (lineIndex - (displayLines.length - 1) / 2) *
                        fontSize *
                        KEYWORD_BUBBLE_LABEL_LINE_HEIGHT_RATIO
                      }
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            </g>
          )
        )}
      </svg>

      <KeywordBubbleTooltip tooltip={activeTooltip} />

      <ul className="sr-only">
        {bubbleNodes.map(({ frequency, id, importance, keyword }) => (
          <li key={id}>
            {keyword}, 중요도 {importance}%, 등장 횟수 {frequency}회
          </li>
        ))}
      </ul>
    </div>
  );
}
