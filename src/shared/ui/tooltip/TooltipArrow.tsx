'use client';

import { cva } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';

import { useTooltipContext } from './TooltipContext';

import type { TooltipArrowProps } from './Tooltip.types';

const tooltipArrowVariants = cva(
  'absolute size-2 rotate-45 border-gray-700 bg-gray-900 shadow-[0_0_16px_rgba(118,186,255,0.18)]',
  {
    variants: {
      placement: {
        bottom: '-top-1 left-1/2 -translate-x-1/2 border-l border-t',
        left: '-right-1 top-1/2 -translate-y-1/2 border-r border-t',
        right: '-left-1 top-1/2 -translate-y-1/2 border-b border-l',
        top: '-bottom-1 left-1/2 -translate-x-1/2 border-b border-r',
      },
    },
  }
);

/**
 * ## Tooltip.Arrow
 *
 * @description
 * Tooltip.Content의 방향을 시각적으로 연결하는 작은 화살표입니다.
 *
 * ### 주요 내용
 *
 * Arrow는 Root의 `placement` 값을 읽어 Content의 상하좌우 가장자리에 배치됩니다.
 * 별도 상태를 가지지 않으며, Content 안에 선택적으로 조합해서 사용합니다.
 *
 * ### 접근성
 *
 * Arrow는 장식 요소이므로 `aria-hidden="true"`가 자동으로 적용됩니다.
 * 안내 문구 자체는 `Tooltip.Content`의 children으로 전달합니다.
 *
 * @example
 * ```tsx
 * <Tooltip.Content>
 *   상세 설명입니다.
 *   <Tooltip.Arrow />
 * </Tooltip.Content>
 * ```
 */
export function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  const { state } = useTooltipContext();

  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(tooltipArrowVariants({ placement: state.placement }), className)}
    />
  );
}
