'use client';

import { useCallback, useId, useMemo } from 'react';

import { useControllableState } from '@/shared/hooks';

import { SurfaceClose } from './SurfaceClose';
import { SurfaceContent } from './SurfaceContent';
import { SurfaceContext } from './SurfaceContext';
import { SurfaceOverlay } from './SurfaceOverlay';
import { SurfacePortal } from './SurfacePortal';
import { SurfaceBody, SurfaceFooter, SurfaceHeader } from './SurfaceSections';
import { SurfaceTrigger } from './SurfaceTrigger';

import type {
  SurfaceCloseReason,
  SurfaceContextValue,
  SurfaceOpenChangeReason,
  SurfaceProps,
} from './Surface.types';

/**
 * ## Surface
 *
 * @description
 * 화면 위에 표시되는 공통 표면 UI를 만드는 Compound 컴포넌트입니다.
 * `variant`로 중앙 모달(`modal`)과 우측 패널(`panel`) 표현을 선택합니다.
 *
 * ### 주요 내용
 *
 * `open`을 전달하면 controlled 방식으로 동작하고, 생략하면 `defaultOpen`을 기준으로
 * 내부 상태를 관리합니다. ESC 닫기, 외부 클릭 닫기, Focus Trap, Focus Restore,
 * Scroll Lock을 공통 인터페이스로 제공합니다.
 *
 * ### 접근성
 *
 * `Surface.Content`는 `role="dialog"`를 렌더링합니다. 접근성 이름은 `aria-label` 또는
 * `aria-labelledby`로 명시합니다. `variant="modal"`에서는 `aria-modal`과 기본 scroll lock이
 * 적용됩니다.
 *
 * @example 중앙 모달
 * ```tsx
 * <Surface variant="modal">
 *   <Surface.Trigger>열기</Surface.Trigger>
 *   <Surface.Portal>
 *     <Surface.Overlay />
 *     <Surface.Content aria-label="제목">
 *       <Surface.Header>제목</Surface.Header>
 *       <Surface.Body>내용</Surface.Body>
 *       <Surface.Footer>
 *         <Surface.Close asChild>
 *           <Button>닫기</Button>
 *         </Surface.Close>
 *       </Surface.Footer>
 *     </Surface.Content>
 *   </Surface.Portal>
 * </Surface>
 * ```
 *
 * @example 우측 패널
 * ```tsx
 * <Surface variant="panel">
 *   <Surface.Trigger>패널 열기</Surface.Trigger>
 *   <Surface.Portal>
 *     <Surface.Content aria-label="필터">
 *       <Surface.Header>필터</Surface.Header>
 *       <Surface.Body>...</Surface.Body>
 *     </Surface.Content>
 *   </Surface.Portal>
 * </Surface>
 * ```
 *
 * @param variant - `modal`은 중앙 모달, `panel`은 우측 패널 표현을 사용합니다.
 * @param open - 외부에서 열림 상태를 제어할 때 사용하는 controlled 값입니다.
 * @param defaultOpen - uncontrolled 방식에서 최초로 열어둘지 여부입니다.
 * @param onOpenChange - 열림 상태가 변경될 때 변경 값과 변경 이유를 받습니다.
 * @param canClose - false이면 Close, ESC, outside click 닫기 요청을 차단합니다.
 * @param onClosePrevented - 닫기 요청이 정책에 의해 차단됐을 때 호출됩니다.
 * @param closeOnEscape - ESC 키 닫기 허용 여부입니다.
 * @param closeOnOutsideClick - 외부 영역 클릭 닫기 허용 여부입니다.
 * @param focusTrap - 열린 동안 포커스를 Content 내부에 가둘지 여부입니다.
 * @param restoreFocus - 닫힐 때 열기 전 포커스로 복원할지 여부입니다.
 * @param scrollLock - body scroll lock 적용 여부입니다. 생략하면 variant 기본값을 따릅니다.
 */
function SurfaceRoot({
  canClose = true,
  children,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  defaultOpen = false,
  focusTrap = true,
  onClosePrevented,
  onOpenChange,
  open,
  restoreFocus = true,
  scrollLock,
  variant = 'modal',
}: SurfaceProps) {
  const generatedId = useId();
  const shouldLockScroll = scrollLock ?? variant === 'modal';
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: defaultOpen,
    value: open,
  });

  const isCloseAllowed = useCallback(
    (reason: SurfaceCloseReason) => {
      if (!canClose) {
        return false;
      }

      if (reason === 'escape-key' && !closeOnEscape) {
        return false;
      }

      if (reason === 'outside-click' && !closeOnOutsideClick) {
        return false;
      }

      return true;
    },
    [canClose, closeOnEscape, closeOnOutsideClick]
  );

  const requestOpenChange = useCallback(
    (nextOpen: boolean, reason: SurfaceOpenChangeReason = 'programmatic') => {
      if (!nextOpen) {
        const closeReason = reason as SurfaceCloseReason;

        if (!isCloseAllowed(closeReason)) {
          onClosePrevented?.({ reason: closeReason });
          return;
        }
      }

      if (Object.is(isOpen, nextOpen)) {
        return;
      }

      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen, { reason });
    },
    [isCloseAllowed, isOpen, onClosePrevented, onOpenChange, setIsOpen]
  );

  const contextValue = useMemo<SurfaceContextValue>(
    () => ({
      actions: {
        close: (reason) => requestOpenChange(false, reason),
        toggle: (reason = 'trigger') => requestOpenChange(!isOpen, reason),
      },
      meta: {
        contentId: `${variant}-content-${generatedId}`,
      },
      state: {
        focusTrap,
        isOpen,
        restoreFocus,
        scrollLock: shouldLockScroll,
        variant,
      },
    }),
    [focusTrap, generatedId, isOpen, requestOpenChange, restoreFocus, shouldLockScroll, variant]
  );

  return <SurfaceContext value={contextValue}>{children}</SurfaceContext>;
}

const Surface = Object.assign(SurfaceRoot, {
  Body: SurfaceBody,
  Close: SurfaceClose,
  Content: SurfaceContent,
  Footer: SurfaceFooter,
  Header: SurfaceHeader,
  Overlay: SurfaceOverlay,
  Portal: SurfacePortal,
  Trigger: SurfaceTrigger,
});

export { Surface };
