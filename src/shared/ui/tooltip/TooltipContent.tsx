'use client';

import { cva } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';
import { Portal } from '@/shared/ui/portal';

import { useTooltipContext } from './TooltipContext';

import type { TooltipContentProps } from './Tooltip.types';

const tooltipContentVariants = cva(
  [
    'fixed z-(--z-index-tooltip) max-w-70 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2',
    'body-12 font-medium text-gray-50 shadow-(--shadow-tooltip)',
    'outline-none backdrop-blur-sm transition-[opacity,transform,filter] duration-150 ease-out motion-reduce:transition-none',
  ],
  {
    variants: {
      placement: {
        bottom: '-translate-x-1/2',
        left: '-translate-x-full -translate-y-1/2',
        right: '-translate-y-1/2',
        top: '-translate-x-1/2 -translate-y-full',
      },
      state: {
        closed: 'pointer-events-none scale-97 opacity-0 blur-[1px]',
        open: 'scale-100 opacity-100 blur-0',
      },
    },
  }
);

/**
 * ## Tooltip.Content
 *
 * @description
 * Tooltip 안내 문구 컨테이너입니다.
 *
 * ### 주요 내용
 *
 * Content는 Root가 계산한 fixed 좌표에 렌더링됩니다.
 * 표시 위치는 Root의 `placement` 값에 따라 `top`, `right`, `bottom`, `left` 중 하나로
 * 정해지며, 상태에 따라 fade/scale 애니메이션이 적용됩니다.
 *
 * `usePortal`이 true이면 앱 전역 Portal Root 또는 `container`에 portal로 렌더링합니다.
 * 특정 테스트 환경이나 제한된 레이아웃 안에서 portal을 쓰지 않아야 할 때만 `usePortal={false}`를
 * 사용합니다.
 *
 * ### 접근성
 *
 * Content는 `role="tooltip"`을 자동으로 렌더링하고, Trigger의 `aria-describedby`와 연결되는
 * id를 Root에서 주입합니다.
 *
 * @param container - portal을 렌더링할 DOM 요소입니다.
 * 생략하면 앱 전역 Portal Root를 사용합니다.
 * @param usePortal - false이면 현재 React 트리 위치에 그대로 렌더링합니다.
 *
 * @example
 * ```tsx
 * <Tooltip.Content>
 *   채용 공고 URL을 입력하면 AI 분석 정확도가 높아집니다.
 *   <Tooltip.Arrow />
 * </Tooltip.Content>
 * ```
 */
export function TooltipContent({
  children,
  className,
  container,
  ref,
  style,
  usePortal = true,
  ...props
}: TooltipContentProps) {
  const { meta, state } = useTooltipContext();

  if (!state.shouldRenderContent) {
    return null;
  }

  const content = (
    <div
      {...props}
      className={cn(
        tooltipContentVariants({
          placement: state.placement,
          state: state.isOpen ? 'open' : 'closed',
        }),
        className
      )}
      data-placement={state.placement}
      data-state={state.isOpen ? 'open' : 'closed'}
      id={meta.contentId}
      ref={ref}
      role="tooltip"
      style={{
        left: state.position.left,
        top: state.position.top,
        visibility: state.isPositioned ? undefined : 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (!usePortal) {
    return content;
  }

  return <Portal container={container}>{content}</Portal>;
}
