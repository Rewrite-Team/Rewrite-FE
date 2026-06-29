import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

/** Surface가 화면에 표시되는 형태입니다. */
type SurfaceType = 'modal' | 'panel';

/** Surface 열림 상태가 변경된 원인입니다. */
type SurfaceOpenChangeReason =
  | 'close-button'
  | 'escape-key'
  | 'outside-click'
  | 'programmatic'
  | 'trigger';

/** Surface 닫기 요청이 발생한 원인입니다. */
type SurfaceCloseReason = SurfaceOpenChangeReason;

/** `onOpenChange` 콜백에 전달되는 상태 변경 메타 정보입니다. */
interface SurfaceOpenChangeMeta {
  reason: SurfaceOpenChangeReason;
}

/** 닫기 정책 콜백에 전달되는 닫기 요청 메타 정보입니다. */
interface SurfaceCloseMeta {
  reason: SurfaceCloseReason;
}

/** Surface가 공유하는 공통 props입니다. */
interface SurfaceProps {
  /** dismiss 닫기 요청을 전역적으로 허용할지 여부입니다. Close 버튼은 항상 닫힙니다. */
  canClose?: boolean;
  /** Surface compound 하위 컴포넌트입니다. */
  children: ReactNode;
  /** ESC 키로 닫을 수 있는지 여부입니다. */
  closeOnEscape?: boolean;
  /** Content 바깥 pointer down으로 닫을 수 있는지 여부입니다. */
  closeOnOutsideClick?: boolean;
  /** uncontrolled 방식에서 최초로 열어둘지 여부입니다. */
  defaultOpen?: boolean;
  /** 열린 동안 포커스를 Content 안에 가둘지 여부입니다. */
  focusTrap?: boolean;
  /** 닫기 요청이 정책에 의해 차단됐을 때 호출됩니다. */
  onClosePrevented?: (meta: SurfaceCloseMeta) => void;
  /** 열림 상태가 변경될 때 호출됩니다. */
  onOpenChange?: (open: boolean, meta: SurfaceOpenChangeMeta) => void;
  /** controlled 방식으로 열림 상태를 제어할 때 사용합니다. */
  open?: boolean;
  /** 닫힌 뒤 열기 전 포커스로 복원할지 여부입니다. */
  restoreFocus?: boolean;
  /** body scroll lock 적용 여부입니다. 생략하면 variant 기본값을 사용합니다. */
  scrollLock?: boolean;
  /** 중앙 모달 또는 우측 패널 표현을 선택합니다. */
  variant?: SurfaceType;
}

/** Surface.Portal이 렌더링될 수 있는 DOM container 타입입니다. */
type SurfacePortalContainer = DocumentFragment | Element;

/** Surface.Portal props입니다. */
interface SurfacePortalProps {
  children: ReactNode;
  /** portal을 렌더링할 대상 요소입니다. */
  container?: SurfacePortalContainer | null;
}

/** Surface.Trigger가 직접 button을 렌더링할 때 사용하는 props입니다. */
type SurfaceTriggerButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-controls' | 'aria-expanded' | 'children' | 'type'
>;

interface SurfaceTriggerAsChildProps {
  asChild: true;
  children: ReactElement<{
    className?: string;
    onClick?: ComponentPropsWithRef<'button'>['onClick'];
  }>;
  className?: string;
  onClick?: ComponentPropsWithRef<'button'>['onClick'];
}

/** Surface.Trigger props입니다. */
type SurfaceTriggerProps =
  | (SurfaceTriggerButtonProps & {
      /** 자식 컴포넌트에 Trigger 동작과 ARIA 속성을 위임할지 여부입니다. */
      asChild?: false;
      children: ReactNode;
    })
  | SurfaceTriggerAsChildProps;

/** Surface.Overlay props입니다. */
type SurfaceOverlayProps = ComponentPropsWithRef<'div'>;

type SurfaceContentBaseProps = Omit<
  ComponentPropsWithRef<'div'>,
  'aria-label' | 'aria-labelledby' | 'role'
>;

type SurfaceContentAccessibilityProps =
  | {
      /** Surface.Content의 접근성 이름입니다. */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Surface.Content의 접근성 이름으로 사용할 heading id입니다. */
      'aria-labelledby': string;
    };

/** Surface.Content props입니다. 접근성 이름을 반드시 전달해야 합니다. */
type SurfaceContentProps = SurfaceContentBaseProps & SurfaceContentAccessibilityProps;

/** Surface Header, Body, Footer가 공유하는 props입니다. */
interface SurfaceSectionProps extends ComponentPropsWithRef<'div'> {
  children: ReactNode;
}

type SurfaceCloseBaseButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-label' | 'children' | 'type'
>;

type SurfaceCloseButtonProps = SurfaceCloseBaseButtonProps & {
  /** 닫기 동작의 접근성 이름입니다. */
  'aria-label': string;
  /** 닫기 버튼의 텍스트 또는 아이콘입니다. */
  children: ReactNode;
};

interface SurfaceCloseAsChildProps {
  /** 닫기 동작의 접근성 이름입니다. asChild 사용 시 자식 요소에 전달됩니다. */
  'aria-label': string;
  asChild: true;
  children: ReactElement<{
    'aria-label'?: string;
    className?: string;
    onClick?: ComponentPropsWithRef<'button'>['onClick'];
  }>;
  className?: string;
  onClick?: ComponentPropsWithRef<'button'>['onClick'];
}

type SurfaceCloseProps =
  | (SurfaceCloseButtonProps & {
      /** 자식 컴포넌트에 Close 동작을 위임할지 여부입니다. */
      asChild?: false;
    })
  | SurfaceCloseAsChildProps;

/** Surface Context가 하위 컴포넌트에 제공하는 상태입니다. */
interface SurfaceState {
  focusTrap: boolean;
  isOpen: boolean;
  restoreFocus: boolean;
  scrollLock: boolean;
  variant: SurfaceType;
}

/** Surface Context가 하위 컴포넌트에 제공하는 액션입니다. */
interface SurfaceActions {
  close: (reason: SurfaceCloseReason) => void;
  toggle: (reason?: SurfaceOpenChangeReason) => void;
}

/** Surface Context에서 사용하는 자동 생성 id 모음입니다. */
interface SurfaceMeta {
  contentId: string;
}

/** Surface compound 하위 컴포넌트가 공유하는 Context 값입니다. */
interface SurfaceContextValue {
  actions: SurfaceActions;
  meta: SurfaceMeta;
  state: SurfaceState;
}

export type {
  SurfaceCloseMeta,
  SurfaceCloseReason,
  SurfaceContextValue,
  SurfaceCloseProps,
  SurfaceContentProps,
  SurfaceOverlayProps,
  SurfaceOpenChangeMeta,
  SurfaceOpenChangeReason,
  SurfacePortalProps,
  SurfaceProps,
  SurfaceSectionProps,
  SurfaceType,
  SurfaceTriggerProps,
};
