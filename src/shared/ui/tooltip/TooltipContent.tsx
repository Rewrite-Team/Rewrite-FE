'use client';

import { Tooltip } from '@base-ui/react/tooltip';

import { PORTAL_ROOT_ID } from '@/shared/constants/portal';
import { cn } from '@/shared/styles/utils/cn';

import { useTooltipConfigContext } from './TooltipConfigContext';

import type { TooltipContentProps } from './Tooltip.types';

const tooltipContentClassNames = [
  'z-(--z-index-tooltip) max-w-70 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2',
  'body-12 font-medium text-gray-50 shadow-(--shadow-tooltip)',
  'origin-[var(--transform-origin)] scale-100 opacity-100 blur-0 outline-none backdrop-blur-sm',
  'transition-[opacity,transform,filter] duration-150 ease-out',
  'data-starting-style:pointer-events-none data-starting-style:scale-97 data-starting-style:opacity-0 data-starting-style:blur-[1px]',
  'data-ending-style:pointer-events-none data-ending-style:scale-97 data-ending-style:opacity-0 data-ending-style:blur-[1px]',
  'data-instant:transition-none motion-reduce:transition-none',
];

const getDefaultPortalContainer = (): HTMLElement | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.getElementById(PORTAL_ROOT_ID) ?? document.body;
};

/**
 * ## Tooltip.Content
 *
 * @description
 * 짧은 안내 문구를 Portal에 렌더링합니다.
 * `container`를 생략하면 앱 전역 Portal Root를 사용합니다.
 * 중요한 설명이나 상호작용 요소는 넣지 않습니다.
 */
export function TooltipContent({
  children,
  className,
  container,
  ref,
  style,
  ...props
}: TooltipContentProps) {
  const { offset, placement } = useTooltipConfigContext();

  const content = (
    <Tooltip.Positioner side={placement} sideOffset={offset}>
      <Tooltip.Popup
        {...props}
        className={cn(tooltipContentClassNames, className)}
        ref={ref}
        style={style}
      >
        {children}
      </Tooltip.Popup>
    </Tooltip.Positioner>
  );

  return (
    <Tooltip.Portal container={container ?? getDefaultPortalContainer()}>{content}</Tooltip.Portal>
  );
}
