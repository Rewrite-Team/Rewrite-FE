'use client';

import { Children, cloneElement, isValidElement } from 'react';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { cn } from '@/shared/styles/utils/cn';

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

const getSingleTriggerChild = (children: SurfaceTriggerProps['children']) => {
  if (Children.count(children) !== 1) {
    throw new Error('Surface.Trigger with asChild must receive exactly one React element child.');
  }

  const child = Children.only(children);

  if (!isValidElement<SurfaceTriggerChildProps>(child)) {
    throw new Error('Surface.Trigger with asChild must receive a valid React element child.');
  }

  return child as ReactElement<SurfaceTriggerChildProps>;
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
  const { children, className, onClick } = props;

  const createHandleClick =
    (
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
    const child = getSingleTriggerChild(children);

    return cloneElement(child, {
      ...triggerProps,
      className: cn(child.props.className, className),
      onClick: createHandleClick(child.props.onClick),
    });
  }

  const {
    asChild: _asChild,
    children: _children,
    className: _className,
    onClick: _onClick,
    ref,
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      {...triggerProps}
      className={className}
      onClick={createHandleClick()}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}
