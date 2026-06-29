'use client';

import type { ComponentPropsWithRef } from 'react';

import { cloneSlot, getSingleSlotChild, getSlotProps } from '@/shared/utils/slot';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceCloseProps } from './Surface.types';

interface SurfaceCloseChildProps {
  'aria-label'?: string;
  className?: string;
  onClick?: ComponentPropsWithRef<'button'>['onClick'];
}

const getCloseButtonProps = (props: Extract<SurfaceCloseProps, { asChild?: false }>) => {
  const buttonProps = { ...props };

  delete buttonProps.asChild;
  return buttonProps;
};

/**
 * ## Surface.Close
 *
 * @description
 * Surface 닫기 요청을 발생시키는 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * Surface의 닫기 정책과 무관하게 항상 닫기를 요청합니다.
 *
 * ### 접근성
 *
 * `aria-label`은 필수이며, `asChild` 사용 시 자식 요소에 전달됩니다.
 *
 * @example
 * ```tsx
 * <Surface.Close aria-label="모달 닫기" asChild>
 *   <Button>닫기</Button>
 * </Surface.Close>
 *
 * <Surface.Close aria-label="모달 닫기" asChild>
 *   <Button aria-label="모달 닫기" iconOnly>
 *     <CloseIcon aria-hidden="true" />
 *   </Button>
 * </Surface.Close>
 * ```
 */
export function SurfaceClose(props: SurfaceCloseProps) {
  const { actions } = useSurfaceContext();

  const createHandleClick =
    (
      onClick?: SurfaceCloseChildProps['onClick'],
      childOnClick?: SurfaceCloseChildProps['onClick']
    ): NonNullable<SurfaceCloseChildProps['onClick']> =>
    (event) => {
      childOnClick?.(event);
      onClick?.(event);
      actions.close('close-button');
    };

  if (props.asChild) {
    const { children, onClick } = props;
    const slotProps = getSlotProps(props);
    const child = getSingleSlotChild<SurfaceCloseChildProps>(children, 'Surface.Close');

    return cloneSlot(child, {
      ...slotProps,
      onClick: createHandleClick(onClick, child.props.onClick),
    });
  }

  const { children, className, onClick, ref, ...buttonProps } = getCloseButtonProps(props);

  return (
    <button
      {...buttonProps}
      className={className}
      onClick={createHandleClick(onClick)}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}
