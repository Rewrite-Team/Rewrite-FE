'use client';

import { Tooltip } from '@base-ui/react/tooltip';

import { cn } from '@/shared/styles/utils/cn';

import type { TooltipTriggerProps } from './Tooltip.types';

const TOOLTIP_OPEN_DELAY_MS = 300;

const omitAsChild = <TProps extends TooltipTriggerProps>(
  props: TProps
): Omit<TProps, 'asChild'> => {
  const triggerProps = { ...props };

  delete triggerProps.asChild;
  return triggerProps;
};

/**
 * ## Tooltip.Trigger
 *
 * @description
 * Hover 또는 focus 시 Tooltip을 여는 Trigger입니다.
 * `asChild`에는 Fragment가 아닌 단일 요소를 전달하고, 아이콘만 있다면 `aria-label`을 제공합니다.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  if (props.asChild) {
    const { children, ...triggerProps } = omitAsChild(props);

    return <Tooltip.Trigger {...triggerProps} delay={TOOLTIP_OPEN_DELAY_MS} render={children} />;
  }

  const { children, className, ...buttonProps } = omitAsChild(props);

  return (
    <Tooltip.Trigger
      {...buttonProps}
      className={cn('focus-ring', className)}
      delay={TOOLTIP_OPEN_DELAY_MS}
      type="button"
    >
      {children}
    </Tooltip.Trigger>
  );
}
