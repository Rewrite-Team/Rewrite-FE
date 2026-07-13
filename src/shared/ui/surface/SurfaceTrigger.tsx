'use client';

import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { cloneSlot, getSingleSlotChild, getSlotProps } from '@/shared/utils/slot';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceTriggerProps } from './Surface.types';

interface SurfaceTriggerChildProps {
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  className?: string;
  'data-state'?: 'closed' | 'open';
  'data-surface-trigger'?: string;
  onClick?: ComponentPropsWithRef<'button'>['onClick'];
}

const getTriggerButtonProps = (props: Extract<SurfaceTriggerProps, { asChild?: false }>) => {
  const buttonProps = { ...props };

  delete buttonProps.asChild;
  return buttonProps;
};

/**
 * ## Surface.Trigger
 *
 * @description
 * Surface의 열림 상태를 토글하는 button 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 클릭 시 `Surface`의 상태를 `trigger` 이유로 변경합니다.
 * `aria-controls`와 `aria-expanded`는 `Surface.Content`와 연결되도록 자동 설정됩니다.
 *
 * ### 접근성
 *
 * 아이콘만 표시하는 Trigger라면 반드시 `aria-label`을 전달해야 합니다.
 *
 * @example 공통 Button 사용
 * ```tsx
 * <Surface.Trigger asChild>
 *   <Button>필터 열기</Button>
 * </Surface.Trigger>
 * ```
 */
export function SurfaceTrigger(props: SurfaceTriggerProps) {
  const { actions, meta, state } = useSurfaceContext();

  const createHandleClick =
    (
      onClick?: SurfaceTriggerChildProps['onClick'],
      childOnClick?: SurfaceTriggerChildProps['onClick']
    ): NonNullable<SurfaceTriggerChildProps['onClick']> =>
    (event) => {
      childOnClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      actions.toggle('trigger');
    };

  const triggerState: SurfaceTriggerChildProps['data-state'] = state.isOpen ? 'open' : 'closed';
  const triggerProps = {
    'aria-controls': meta.contentId,
    'aria-expanded': state.isOpen,
    'data-state': triggerState,
    'data-surface-trigger': meta.contentId,
  };

  if (props.asChild) {
    const { children, onClick } = props;
    const slotProps = getSlotProps(props);
    const child = getSingleSlotChild<SurfaceTriggerChildProps>(children, 'Surface.Trigger');

    return cloneSlot(child, {
      ...triggerProps,
      ...slotProps,
      onClick: createHandleClick(onClick, child.props.onClick),
    });
  }

  const { children, className, onClick, ref, ...buttonProps } = getTriggerButtonProps(props);

  return (
    <button
      {...buttonProps}
      {...triggerProps}
      className={cn('focus-ring', className)}
      onClick={createHandleClick(onClick)}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}
