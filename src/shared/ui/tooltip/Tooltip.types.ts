import type { ComponentPropsWithRef, PointerEventHandler, ReactElement, ReactNode } from 'react';

import type { PortalContainer } from '@/shared/ui/portal';

type TooltipPlacement = 'bottom' | 'left' | 'right' | 'top';

type TooltipOpenChangeReason = 'blur' | 'focus' | 'hover';

interface TooltipOpenChangeMeta {
  /**
   * 열림 상태가 변경된 이유입니다.
   *
   * `hover`는 pointer enter/leave, `focus`는 focus 진입, `blur`는 focus 이탈에 의해
   * 상태가 바뀌었음을 의미합니다.
   */
  reason: TooltipOpenChangeReason;
}

interface TooltipProps {
  /**
   * Tooltip compound 하위 컴포넌트입니다.
   *
   * 일반적으로 `Tooltip.Trigger`와 `Tooltip.Content`를 포함하고, 필요할 때
   * `Tooltip.Arrow`를 Content 내부에 조합합니다.
   */
  children: ReactNode;
  /**
   * uncontrolled 방식에서 최초로 열어둘지 여부입니다.
   *
   * Storybook 시각 확인이나 특정 온보딩 상태처럼 최초 진입 시 설명을 보여줘야 하는 경우에만
   * 사용합니다.
   * 일반 사용에서는 기본값 false를 권장합니다.
   */
  defaultOpen?: boolean;
  /**
   * Tooltip과 Trigger 사이 간격입니다.
   *
   * px 단위 숫자를 전달합니다.
   * 값이 클수록 Trigger와 Content 사이 거리가 멀어집니다.
   */
  offset?: number;
  /**
   * 열림 상태가 변경될 때 호출됩니다.
   *
   * controlled 상태 동기화, 분석 이벤트, 테스트 확인 등에 사용할 수 있습니다.
   * 변경 원인은 두 번째 인자의 `reason`으로 전달됩니다.
   */
  onOpenChange?: (open: boolean, meta: TooltipOpenChangeMeta) => void;
  /**
   * controlled 방식으로 열림 상태를 제어할 때 사용합니다.
   *
   * 값을 전달하면 Root 내부 상태 대신 외부 상태를 기준으로 열림 여부가 결정됩니다.
   */
  open?: boolean;
  /**
   * Tooltip 표시 위치입니다.
   *
   * `top`, `right`, `bottom`, `left`를 지원합니다.
   * 위치는 Trigger 기준으로 계산됩니다.
   */
  placement?: TooltipPlacement;
}

type TooltipTriggerButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'type'>;

interface TooltipTriggerAsChildProps {
  /**
   * 자식 컴포넌트에 Trigger 동작과 ARIA 속성을 위임할지 여부입니다.
   *
   * 기존 Button, Link, icon button을 Tooltip Trigger로 사용할 때 true로 설정합니다.
   */
  asChild: true;
  /**
   * Trigger로 사용할 단일 React Element입니다.
   *
   * 단일 Element만 허용되며 Fragment는 사용할 수 없습니다.
   */
  children: ReactElement<{
    'aria-describedby'?: string;
    className?: string;
    onBlur?: ComponentPropsWithRef<'button'>['onBlur'];
    onFocus?: ComponentPropsWithRef<'button'>['onFocus'];
    onPointerEnter?: PointerEventHandler;
    onPointerLeave?: PointerEventHandler;
  }>;
}

type TooltipTriggerProps =
  | (TooltipTriggerButtonProps & {
      /**
       * 자식 컴포넌트에 Trigger 동작과 ARIA 속성을 위임할지 여부입니다.
       *
       * false이거나 생략하면 `Tooltip.Trigger`가 직접 button을 렌더링합니다.
       */
      asChild?: false;
      /**
       * Trigger 버튼에 표시할 내용입니다.
       *
       * 아이콘만 전달하는 경우 접근성 이름을 위해 `aria-label`도 함께 전달합니다.
       */
      children: ReactNode;
    })
  | (TooltipTriggerButtonProps & TooltipTriggerAsChildProps);

interface TooltipContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
  /**
   * Tooltip에 표시할 안내 문구 또는 조합 UI입니다.
   *
   * 짧은 읽기 전용 설명을 전달합니다.
   * focus 가능한 요소나 복잡한 액션 UI는 넣지 않습니다.
   */
  children: ReactNode;
  /**
   * portal을 렌더링할 대상 요소입니다.
   *
   * 생략하면 앱 전역 Portal Root를 사용합니다. `null`을 전달하면 portal 렌더링을 하지 않습니다.
   */
  container?: PortalContainer | null;
  /**
   * false이면 portal을 사용하지 않고 현재 React 트리 위치에 렌더링합니다.
   *
   * 기본값은 true입니다.
   * 대부분의 제품 UI에서는 부모 overflow 영향을 줄이기 위해 기본값을 유지합니다.
   */
  usePortal?: boolean;
}

type TooltipArrowProps = Omit<ComponentPropsWithRef<'span'>, 'children'>;

interface TooltipPosition {
  left: number;
  top: number;
}

interface TooltipState {
  isPositioned: boolean;
  isOpen: boolean;
  placement: TooltipPlacement;
  position: TooltipPosition;
  shouldRenderContent: boolean;
}

interface TooltipActions {
  hideForBlur: () => void;
  hideForPointer: () => void;
  setTriggerElement: (element: HTMLElement | null) => void;
  showForFocus: () => void;
  showForPointer: () => void;
}

interface TooltipMeta {
  contentId: string;
}

interface TooltipContextValue {
  actions: TooltipActions;
  meta: TooltipMeta;
  state: TooltipState;
}

export type {
  TooltipActions,
  TooltipArrowProps,
  TooltipContentProps,
  TooltipContextValue,
  TooltipMeta,
  TooltipOpenChangeMeta,
  TooltipOpenChangeReason,
  TooltipPlacement,
  TooltipPosition,
  TooltipProps,
  TooltipState,
  TooltipTriggerProps,
};
