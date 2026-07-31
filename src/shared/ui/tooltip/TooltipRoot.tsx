'use client';

import { useMemo } from 'react';

import { Tooltip } from '@base-ui/react/tooltip';

import { TooltipConfigContext } from './TooltipConfigContext';

import type { TooltipRootProps } from './Tooltip.types';
import type { TooltipConfigContextValue } from './TooltipConfigContext';

/**
 * ## Tooltip.Root
 *
 * @description
 * Hover 또는 focus 시 필수가 아닌 짧은 시각적 설명을 표시하는 compound Tooltip입니다.
 * 아이콘만 있는 Trigger에는 설명과 일치하는 `aria-label`을 제공해야 합니다.
 *
 * @example
 * ```tsx
 * <Tooltip.Root placement="top">
 *   <Tooltip.Trigger
 *     render={<Button aria-label="도움말" iconOnly>?</Button>}
 *   />
 *   <Tooltip.Content>
 *     AI 첨삭 결과는 자기소개서 문항별로 생성됩니다.
 *     <Tooltip.Arrow />
 *   </Tooltip.Content>
 * </Tooltip.Root>
 * ```
 */
function TooltipRoot({
  children,
  defaultOpen = false,
  offset = 10,
  onOpenChange,
  open,
  placement = 'top',
}: TooltipRootProps) {
  const contextValue = useMemo<TooltipConfigContextValue>(
    () => ({
      offset,
      placement,
    }),
    [offset, placement]
  );

  return (
    <Tooltip.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open}>
      <TooltipConfigContext value={contextValue}>{children}</TooltipConfigContext>
    </Tooltip.Root>
  );
}

export { TooltipRoot };
