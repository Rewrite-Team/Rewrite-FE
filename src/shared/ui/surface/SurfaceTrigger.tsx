'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { cn } from '@/shared/styles/utils/cn';

import type { SurfaceTriggerProps } from './Surface.types';

type SurfaceTriggerClickHandler = NonNullable<BaseDialog.Trigger.Props['onClick']>;

/**
 * ## Surface.Trigger
 *
 * @description
 * Surface의 열림 상태를 토글하는 button 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * Base UI Dialog Trigger를 통해 Surface를 열고 닫습니다. `aria-controls`와
 * `aria-expanded`는 `Surface.Content`와 연결되도록 자동 설정됩니다.
 * `asChild`의 자식이 button을 렌더링하지 않으면 `nativeButton={false}`를 전달합니다.
 * 사용자 또는 자식의 `onClick`에서 `preventDefault()`를 호출하면 상태 변경을 취소합니다.
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
  const nativeButton = props.asChild ? props.nativeButton : true;
  const { asChild, children, className, onClick, ...triggerProps } = props;

  const handleClick: SurfaceTriggerClickHandler = (event) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      event.preventBaseUIHandler();
    }
  };

  return (
    <BaseDialog.Trigger
      {...triggerProps}
      className={cn('focus-ring', className)}
      nativeButton={nativeButton}
      onClick={handleClick}
      render={asChild ? children : undefined}
    >
      {asChild ? undefined : children}
    </BaseDialog.Trigger>
  );
}
