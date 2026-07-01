'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '@/shared/hooks';

import { TooltipArrow } from './TooltipArrow';
import { TooltipContent } from './TooltipContent';
import { TooltipContext } from './TooltipContext';
import { TooltipTrigger } from './TooltipTrigger';

import type {
  TooltipOpenChangeReason,
  TooltipPlacement,
  TooltipContextValue,
  TooltipPosition,
  TooltipProps,
} from './Tooltip.types';

const TOOLTIP_EXIT_DURATION = 150;

const getTooltipPosition = (
  trigger: HTMLElement,
  placement: TooltipPlacement,
  offset: number
): TooltipPosition => {
  const rect = trigger.getBoundingClientRect();

  if (placement === 'top') {
    return {
      left: rect.left + rect.width / 2,
      top: rect.top - offset,
    };
  }

  if (placement === 'right') {
    return {
      left: rect.right + offset,
      top: rect.top + rect.height / 2,
    };
  }

  if (placement === 'left') {
    return {
      left: rect.left - offset,
      top: rect.top + rect.height / 2,
    };
  }

  return {
    left: rect.left + rect.width / 2,
    top: rect.bottom + offset,
  };
};

/**
 * ## Tooltip
 *
 * @description
 * 아이콘, 버튼, 링크처럼 짧은 보조 설명이 필요한 요소에 안내 문구를 표시하는 공통
 * Compound Tooltip입니다.
 * 사용자가 특정 UI에 마우스를 올리거나 키보드 포커스를 이동했을 때 보조 정보를 잠깐 보여주는
 * 용도로 사용합니다.
 *
 * ### 주요 내용
 *
 * `Tooltip.Trigger`는 hover와 focus로 열림 상태를 요청하고, `Tooltip.Content`는
 * trigger 위치를 기준으로 fixed 좌표에 렌더링됩니다.
 * `Tooltip.Content`는 기본적으로 앱 전역 Portal Root에 렌더링되므로 부모 요소의
 * `overflow: hidden` 영향을 줄일 수 있습니다.
 *
 * `placement`는 `top`, `right`, `bottom`, `left`를 지원합니다.
 *
 * `open`을 전달하면 controlled 방식으로 동작하고, 생략하면 `defaultOpen`을 초기값으로
 * 내부 상태를 관리합니다.
 * hover와 focus 상태는 서로 분리해서 관리하므로, trigger가 focus된 상태에서 pointer가 벗어나도
 * blur 전까지 안내 문구가 유지됩니다.
 *
 * ### 접근성
 *
 * 열려 있는 동안 Trigger에는 `aria-describedby`가 연결되고 Content는 `role="tooltip"`을
 * 사용합니다.
 * 키보드 사용자는 Trigger focus로 설명을 확인할 수 있습니다.
 * 아이콘만 있는 Trigger를 사용할 때는 trigger 자체에 `aria-label`을 제공해야 합니다.
 *
 *
 * ### 조합
 *
 * `Tooltip`은 `Tooltip.Root`와 같은 루트 컴포넌트이며, compound API 사용을 위해
 * `Tooltip.Trigger`, `Tooltip.Content`, `Tooltip.Arrow`를 함께 노출합니다.
 *
 * @param children - `Tooltip.Trigger`, `Tooltip.Content`, `Tooltip.Arrow`를 조합한 하위 요소입니다.
 * @param placement - Tooltip 표시 위치입니다.
 * `top`, `right`, `bottom`, `left`를 지원합니다.
 * @param offset - Trigger와 Tooltip 사이 간격입니다.
 * 단위는 px입니다.
 * @param open - 외부에서 열림 상태를 제어할 때 사용하는 controlled 값입니다.
 * @param defaultOpen - uncontrolled 방식에서 최초 렌더링 시 열어둘지 여부입니다.
 * @param onOpenChange - 열림 상태가 변경될 때 호출됩니다.
 * 변경 원인은 meta.reason으로 전달됩니다.
 *
 * @example
 * ```tsx
 * <Tooltip placement="top">
 *   <Tooltip.Trigger asChild>
 *     <Button aria-label="도움말" iconOnly>?</Button>
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>
 *     AI 첨삭 결과는 자기소개서 문항별로 생성됩니다.
 *     <Tooltip.Arrow />
 *   </Tooltip.Content>
 * </Tooltip>
 * ```
 *
 * @example controlled 사용
 * ```tsx
 * <Tooltip open={isOpen} onOpenChange={setIsOpen}>
 *   <Tooltip.Trigger asChild>
 *     <button type="button">도움말</button>
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>입력 기준을 확인할 수 있습니다.</Tooltip.Content>
 * </Tooltip>
 * ```
 */
function TooltipRoot({
  children,
  defaultOpen = false,
  offset = 10,
  onOpenChange,
  open,
  placement = 'top',
}: TooltipProps) {
  const generatedId = useId();
  const isFocusedRef = useRef(false);
  const isPointerInsideRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: defaultOpen,
    value: open,
  });
  const [isPositioned, setIsPositioned] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const [shouldRenderContent, setShouldRenderContent] = useState(defaultOpen || open === true);
  const [position, setPosition] = useState<TooltipPosition>({ left: 0, top: 0 });

  if (previousOpen !== isOpen) {
    setPreviousOpen(isOpen);

    if (isOpen) {
      setShouldRenderContent(true);
      setIsPositioned(false);
    }
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    setPosition(getTooltipPosition(triggerRef.current, placement, offset));
    setIsPositioned(true);
  }, [offset, placement]);

  const requestOpenChange = useCallback(
    (nextOpen: boolean, reason: TooltipOpenChangeReason) => {
      if (Object.is(isOpen, nextOpen)) {
        return;
      }

      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen, { reason });
    },
    [isOpen, onOpenChange, setIsOpen]
  );

  const requestCloseIfInactive = useCallback(
    (reason: TooltipOpenChangeReason) => {
      if (!isFocusedRef.current && !isPointerInsideRef.current) {
        requestOpenChange(false, reason);
      }
    },
    [requestOpenChange]
  );

  useLayoutEffect(() => {
    if (isOpen && shouldRenderContent) {
      updatePosition();
    }
  }, [isOpen, shouldRenderContent, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = window.setTimeout(() => {
        setShouldRenderContent(false);
      }, TOOLTIP_EXIT_DURATION);

      return () => window.clearTimeout(timeoutId);
    }

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const contextValue = useMemo<TooltipContextValue>(
    () => ({
      actions: {
        hideForBlur: () => {
          isFocusedRef.current = false;
          requestCloseIfInactive('blur');
        },
        hideForPointer: () => {
          isPointerInsideRef.current = false;
          requestCloseIfInactive('hover');
        },
        setTriggerElement: (element) => {
          triggerRef.current = element;
        },
        showForFocus: () => {
          isFocusedRef.current = true;
          requestOpenChange(true, 'focus');
        },
        showForPointer: () => {
          isPointerInsideRef.current = true;
          requestOpenChange(true, 'hover');
        },
      },
      meta: {
        contentId: `tooltip-content-${generatedId}`,
      },
      state: {
        isPositioned,
        isOpen,
        placement,
        position,
        shouldRenderContent: isOpen || shouldRenderContent,
      },
    }),
    [
      generatedId,
      isOpen,
      isPositioned,
      placement,
      position,
      requestCloseIfInactive,
      requestOpenChange,
      shouldRenderContent,
    ]
  );

  return <TooltipContext value={contextValue}>{children}</TooltipContext>;
}

const Tooltip = Object.assign(TooltipRoot, {
  Arrow: TooltipArrow,
  Content: TooltipContent,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
});

export { Tooltip };
