'use client';

import { Tooltip } from '@base-ui/react/tooltip';

import { cn } from '@/shared/styles/utils/cn';

import type { TooltipTriggerProps } from './Tooltip.types';

const TOOLTIP_OPEN_DELAY_MS = 300;

/**
 * ## Tooltip.Trigger
 *
 * @description
 * Hover 또는 focus 시 Tooltip을 여는 Trigger입니다.
 * 기존 요소를 Trigger로 사용하려면 Base UI의 `render` prop을 전달합니다.
 * 아이콘만 있다면 `aria-label`을 제공합니다.
 */
export function TooltipTrigger({
  children,
  className,
  render,
  ...triggerProps
}: TooltipTriggerProps) {
  if (render) {
    return (
      <Tooltip.Trigger
        {...triggerProps}
        className={className}
        delay={TOOLTIP_OPEN_DELAY_MS}
        render={render}
      >
        {children}
      </Tooltip.Trigger>
    );
  }

  return (
    <Tooltip.Trigger
      {...triggerProps}
      className={cn('focus-ring', className)}
      delay={TOOLTIP_OPEN_DELAY_MS}
      type="button"
    >
      {children}
    </Tooltip.Trigger>
  );
}
