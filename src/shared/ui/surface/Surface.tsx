'use client';

import { useCallback, useMemo } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { useControllableState, useScrollLock } from '@/shared/hooks';

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
  SurfaceType,
} from './Surface.types';

interface SurfaceClosePolicy {
  canClose: boolean;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  reason: SurfaceCloseReason;
}

type DialogModality = NonNullable<BaseDialog.Root.Props['modal']>;

const getDialogModality = (
  focusTrap: boolean,
  scrollLock: boolean,
  variant: SurfaceType
): DialogModality => {
  if (!focusTrap) {
    return false;
  }

  return variant === 'modal' && scrollLock ? true : 'trap-focus';
};

const getSurfaceOpenChangeReason = (
  reason: BaseDialog.Root.ChangeEventReason
): SurfaceOpenChangeReason => {
  switch (reason) {
    case 'close-press':
      return 'close-button';
    case 'escape-key':
      return 'escape-key';
    case 'outside-press':
      return 'outside-click';
    case 'trigger-press':
      return 'trigger';
    default:
      return 'programmatic';
  }
};

const isSurfaceCloseAllowed = ({
  canClose,
  closeOnEscape,
  closeOnOutsideClick,
  reason,
}: SurfaceClosePolicy) => {
  if (reason === 'close-button') {
    return true;
  }

  if (!canClose) {
    return false;
  }

  if (reason === 'escape-key') {
    return closeOnEscape;
  }

  if (reason === 'outside-click') {
    return closeOnOutsideClick;
  }

  return true;
};

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
 * 상태를 관리합니다. Base UI Dialog를 통해 ESC 닫기, 외부 클릭 닫기, Focus Trap,
 * Focus Restore, Scroll Lock을 공통 인터페이스로 제공합니다.
 *
 * ### 접근성
 *
 * `Surface.Content`는 `role="dialog"`를 렌더링합니다. 접근성 이름은 `aria-label` 또는
 * `aria-labelledby`로 명시합니다. 실제로 배경 상호작용을 제한하는 modal 동작일 때만
 * `aria-modal`이 적용됩니다.
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
 *         <Surface.Close aria-label="모달 닫기" asChild>
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
 * @param canClose - false이면 Surface.Close를 제외한 모든 닫기 요청을 차단합니다.
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
  const shouldLockScroll = scrollLock ?? variant === 'modal';
  const dialogModality = getDialogModality(focusTrap, shouldLockScroll, variant);
  const requiresCompatibilityScrollLock = shouldLockScroll && dialogModality !== true;
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: defaultOpen,
    value: open,
  });

  // Panel 또는 focusTrap 비활성화처럼 scroll lock만 독립적으로 필요한 경우입니다.
  useScrollLock({
    enabled: isOpen && requiresCompatibilityScrollLock,
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean, eventDetails: BaseDialog.Root.ChangeEventDetails) => {
      // 기존 Surface는 포커스 이탈이 아니라 pointer outside로만 닫혔습니다.
      if (eventDetails.reason === 'focus-out') {
        eventDetails.cancel();
        return;
      }

      const reason = getSurfaceOpenChangeReason(eventDetails.reason);

      if (!nextOpen) {
        if (
          !isSurfaceCloseAllowed({
            canClose,
            closeOnEscape,
            closeOnOutsideClick,
            reason,
          })
        ) {
          eventDetails.cancel();
          onClosePrevented?.({ reason });
          return;
        }
      }

      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen, { reason });
    },
    [canClose, closeOnEscape, closeOnOutsideClick, onClosePrevented, onOpenChange, setIsOpen]
  );

  const contextValue = useMemo<SurfaceContextValue>(
    () => ({
      config: {
        focusTrap,
        isAriaModal: dialogModality === true,
        restoreFocus,
        variant,
      },
    }),
    [dialogModality, focusTrap, restoreFocus, variant]
  );

  return (
    <SurfaceContext value={contextValue}>
      <BaseDialog.Root modal={dialogModality} onOpenChange={handleOpenChange} open={isOpen}>
        {children}
      </BaseDialog.Root>
    </SurfaceContext>
  );
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
