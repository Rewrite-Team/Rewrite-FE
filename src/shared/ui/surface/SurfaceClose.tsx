'use client';

import { Children, cloneElement, isValidElement } from 'react';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceCloseProps } from './Surface.types';

interface SurfaceCloseChildProps {
  className?: string;
  onClick?: ComponentPropsWithRef<'button'>['onClick'];
}

const getSingleCloseChild = (children: SurfaceCloseProps['children']) => {
  if (Children.count(children) !== 1) {
    throw new Error('Surface.Close with asChild must receive exactly one React element child.');
  }

  const child = Children.only(children);

  if (!isValidElement<SurfaceCloseChildProps>(child)) {
    throw new Error('Surface.Close with asChild must receive a valid React element child.');
  }

  return child as ReactElement<SurfaceCloseChildProps>;
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
 * 아이콘 버튼은 공통 Button의 `iconOnly`와 `aria-label`을 사용합니다.
 *
 * @example
 * ```tsx
 * <Surface.Close asChild>
 *   <Button>닫기</Button>
 * </Surface.Close>
 *
 * <Surface.Close asChild>
 *   <Button aria-label="모달 닫기" iconOnly>
 *     <CloseIcon aria-hidden="true" />
 *   </Button>
 * </Surface.Close>
 * ```
 */
export function SurfaceClose(props: SurfaceCloseProps) {
  const { actions } = useSurfaceContext();
  const { children, className, onClick } = props;

  const createHandleClick =
    (
      childOnClick?: SurfaceCloseChildProps['onClick']
    ): NonNullable<SurfaceCloseChildProps['onClick']> =>
    (event) => {
      childOnClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      actions.close('close-button');
    };

  if (props.asChild) {
    const child = getSingleCloseChild(children);

    return cloneElement(child, {
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
      className={className}
      onClick={createHandleClick()}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}
