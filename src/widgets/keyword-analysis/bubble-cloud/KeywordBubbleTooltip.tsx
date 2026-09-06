import { KEYWORD_BUBBLE_VIEWBOX } from './constants';

import type { KeywordBubbleTooltipState } from './types';

interface KeywordBubbleTooltipProps {
  tooltip: KeywordBubbleTooltipState | null;
}

export function KeywordBubbleTooltip({ tooltip }: KeywordBubbleTooltipProps) {
  if (!tooltip) return null;

  return (
    <div
      className={`pointer-events-none absolute z-10 flex min-w-28 -translate-x-1/2 flex-col items-center justify-center gap-0.5 rounded-lg border border-primary-300/15 bg-gray-800/95 px-3 py-2 body-12 text-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm ${
        tooltip.placement === 'top' ? '-translate-y-full' : ''
      }`}
      role="tooltip"
      style={{
        left: `${(tooltip.x / KEYWORD_BUBBLE_VIEWBOX.width) * 100}%`,
        top: `${(tooltip.y / KEYWORD_BUBBLE_VIEWBOX.height) * 100}%`,
      }}
    >
      <strong className="max-w-44 wrap-break-word text-center font-semibold text-white">
        {tooltip.keyword}
      </strong>
      <span>
        중요도 <strong className="font-semibold text-primary-300">{tooltip.importance}%</strong>
      </span>
    </div>
  );
}
