import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import type { Tooltip } from '@base-ui/react/tooltip';

type TooltipPlacement = 'bottom' | 'left' | 'right' | 'top';

type TooltipPortalContainer = HTMLElement | ShadowRoot;

interface TooltipRootProps {
  /** `Tooltip.Trigger`와 `Tooltip.Content`를 포함한 하위 요소입니다. */
  children: ReactNode;
  /** uncontrolled 방식의 초기 열림 상태입니다. */
  defaultOpen?: boolean;
  /** Trigger와 Content 사이의 간격(px)입니다. */
  offset?: number;
  /** 열림 상태와 Base UI의 변경 정보를 전달합니다. */
  onOpenChange?: Tooltip.Root.Props['onOpenChange'];
  /** controlled 방식의 열림 상태입니다. */
  open?: boolean;
  /** Trigger를 기준으로 한 Content의 표시 위치입니다. */
  placement?: TooltipPlacement;
}

type TooltipTriggerButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'type'>;

interface TooltipTriggerAsChildProps {
  /** 단일 자식 요소를 Trigger로 사용합니다. */
  asChild: true;
  /** Trigger로 사용할 단일 React Element입니다. Fragment는 지원하지 않습니다. */
  children: ReactElement;
}

type TooltipTriggerProps =
  | (TooltipTriggerButtonProps & {
      /** 생략하면 Trigger가 button을 렌더링합니다. */
      asChild?: false;
      /** 아이콘만 표시할 때는 `aria-label`도 제공해야 합니다. */
      children: ReactNode;
    })
  | (TooltipTriggerButtonProps & TooltipTriggerAsChildProps);

interface TooltipContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
  /** 짧은 읽기 전용 설명입니다. 상호작용 요소는 넣지 않습니다. */
  children: ReactNode;
  /** Portal 대상입니다. 생략하면 앱 전역 Portal Root를 사용합니다. */
  container?: TooltipPortalContainer;
}

type TooltipArrowProps = Omit<ComponentPropsWithRef<'span'>, 'children'>;

export type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipPlacement,
  TooltipRootProps,
  TooltipTriggerProps,
};
