'use client';

import { useCallback } from 'react';
import type { ComponentPropsWithRef, Ref } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { cloneSlot, getSingleSlotChild, getSlotProps } from '@/shared/utils/slot';

import { useTooltipContext } from './TooltipContext';

import type { TooltipTriggerProps } from './Tooltip.types';

interface TooltipTriggerChildProps {
  'aria-describedby'?: string;
  className?: string;
  'data-state'?: 'closed' | 'open';
  onBlur?: ComponentPropsWithRef<'button'>['onBlur'];
  onFocus?: ComponentPropsWithRef<'button'>['onFocus'];
  onPointerEnter?: ComponentPropsWithRef<'button'>['onPointerEnter'];
  onPointerLeave?: ComponentPropsWithRef<'button'>['onPointerLeave'];
  ref?: Ref<HTMLElement>;
}

const assignRef = <TElement,>(ref: Ref<TElement> | undefined, value: TElement | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
};

const getTriggerButtonProps = (props: Extract<TooltipTriggerProps, { asChild?: false }>) => {
  const buttonProps = { ...props };

  delete buttonProps.asChild;
  return buttonProps;
};

const mergeDescribedBy = (...ids: Array<string | undefined>) => {
  const describedByIds = ids.flatMap((id) => id?.split(/\s+/) ?? []).filter((id) => id.length > 0);

  if (describedByIds.length === 0) {
    return undefined;
  }

  return Array.from(new Set(describedByIds)).join(' ');
};

const composeTooltipEventHandlers =
  <TEvent extends { defaultPrevented: boolean }>(
    childHandler: ((event: TEvent) => void) | undefined,
    triggerHandler: ((event: TEvent) => void) | undefined,
    action: () => void
  ) =>
  (event: TEvent) => {
    childHandler?.(event);

    if (event.defaultPrevented) {
      return;
    }

    triggerHandler?.(event);

    if (!event.defaultPrevented) {
      action();
    }
  };

/**
 * ## Tooltip.Trigger
 *
 * @description
 * Hover 또는 Focus 시 Tooltip을 여는 트리거입니다.
 * 기본은 button이며 `asChild`로 기존 버튼, 아이콘, 링크에 동작과 접근성 속성을 위임할 수
 * 있습니다.
 *
 * ### 주요 내용
 *
 * Trigger는 pointer enter/focus 시 Tooltip을 열고, pointer leave/blur 시 닫힘을 요청합니다.
 * pointer와 focus 상태는 Root에서 함께 판단하므로 키보드 포커스가 유지되는 동안 pointer가
 * 벗어나도 Tooltip이 즉시 닫히지 않습니다.
 *
 * `asChild`를 사용하면 Button, Link, icon button 같은 기존 컴포넌트를 그대로 Trigger로
 * 사용할 수 있습니다.
 * 이때 자식은 단일 React Element여야 하며 Fragment는 허용하지 않습니다.
 *
 * ### 접근성
 *
 * Tooltip이 DOM에 렌더링되는 동안 `aria-describedby`가 자동으로 연결됩니다.
 * 기존 `aria-describedby`가 있으면 Tooltip id와 공백으로 병합되어 기존 설명 연결을
 * 유지합니다.
 * Trigger가 아이콘만 렌더링하는 경우 사용자가 동작을 이해할 수 있도록 `aria-label`을 직접
 * 전달합니다.
 *
 * @example 버튼 컴포넌트를 Trigger로 사용
 * ```tsx
 * <Tooltip.Trigger asChild>
 *   <Button aria-label="AI 첨삭 도움말" iconOnly>
 *     ?
 *   </Button>
 * </Tooltip.Trigger>
 * ```
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  const { actions, meta, state } = useTooltipContext();

  const setTriggerRef = useCallback(
    (element: HTMLElement | null, childRef?: Ref<HTMLElement>) => {
      actions.setTriggerElement(element);
      assignRef(childRef, element);
    },
    [actions]
  );

  const triggerProps = {
    'aria-describedby': state.shouldRenderContent ? meta.contentId : undefined,
    'data-state': state.isOpen ? 'open' : 'closed',
  } as const;

  if (props.asChild) {
    const { children, onBlur, onFocus, onPointerEnter, onPointerLeave } = props;
    const slotProps = getSlotProps(props);
    const child = getSingleSlotChild<TooltipTriggerChildProps>(children, 'Tooltip.Trigger');
    const describedBy = mergeDescribedBy(
      child.props['aria-describedby'],
      slotProps['aria-describedby'],
      triggerProps['aria-describedby']
    );

    return cloneSlot(child, {
      ...slotProps,
      'aria-describedby': describedBy,
      'data-state': triggerProps['data-state'],
      onBlur: composeTooltipEventHandlers(child.props.onBlur, onBlur, actions.hideForBlur),
      onFocus: composeTooltipEventHandlers(child.props.onFocus, onFocus, actions.showForFocus),
      onPointerEnter: composeTooltipEventHandlers(
        child.props.onPointerEnter,
        onPointerEnter,
        actions.showForPointer
      ),
      onPointerLeave: composeTooltipEventHandlers(
        child.props.onPointerLeave,
        onPointerLeave,
        actions.hideForPointer
      ),
      ref: (element) => setTriggerRef(element, child.props.ref),
    });
  }

  const {
    'aria-describedby': describedBy,
    children,
    onBlur,
    onFocus,
    onPointerEnter,
    onPointerLeave,
    ref,
    className,
    ...buttonProps
  } = getTriggerButtonProps(props);

  return (
    <button
      {...buttonProps}
      aria-describedby={mergeDescribedBy(describedBy, triggerProps['aria-describedby'])}
      className={cn('focus-ring', className)}
      data-state={triggerProps['data-state']}
      onBlur={composeTooltipEventHandlers(undefined, onBlur, actions.hideForBlur)}
      onFocus={composeTooltipEventHandlers(undefined, onFocus, actions.showForFocus)}
      onPointerEnter={composeTooltipEventHandlers(
        undefined,
        onPointerEnter,
        actions.showForPointer
      )}
      onPointerLeave={composeTooltipEventHandlers(
        undefined,
        onPointerLeave,
        actions.hideForPointer
      )}
      ref={(element) => setTriggerRef(element, ref)}
      type="button"
    >
      {children}
    </button>
  );
}
