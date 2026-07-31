'use client';

import { Tooltip } from '@base-ui/react/tooltip';

import { cn } from '@/shared/styles/utils/cn';

import type { TooltipArrowProps } from './Tooltip.types';

const tooltipArrowClassNames = [
  'absolute size-2 rotate-45 border-gray-700 bg-gray-900 shadow-(--shadow-tooltip-arrow)',
  'data-[side=bottom]:-top-1 data-[side=bottom]:border-l data-[side=bottom]:border-t',
  'data-[side=left]:-right-1 data-[side=left]:border-r data-[side=left]:border-t',
  'data-[side=right]:-left-1 data-[side=right]:border-b data-[side=right]:border-l',
  'data-[side=top]:-bottom-1 data-[side=top]:border-b data-[side=top]:border-r',
];

/**
 * ## Tooltip.Arrow
 *
 * @description
 * Content와 Trigger의 방향을 보여주는 장식용 화살표입니다.
 * 실제 배치가 바뀌면 방향도 함께 갱신됩니다.
 */
export function TooltipArrow({ className, ref, ...props }: TooltipArrowProps) {
  return (
    <Tooltip.Arrow
      {...props}
      className={cn(tooltipArrowClassNames, className)}
      render={<span ref={ref} />}
    />
  );
}
