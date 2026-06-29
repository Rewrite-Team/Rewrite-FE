'use client';

import { useCallback, useRef } from 'react';
import type { Ref } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';

import { useSurfaceInteractions } from './hooks/useSurfaceInteractions';
import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceContentProps } from './Surface.types';

const surfaceContentVariants = cva(
  [
    'fixed z-(--z-index-surface-content) flex flex-col overflow-hidden bg-gray-800 text-white shadow-2xl outline-none',
    'transition-opacity duration-150',
  ],
  {
    variants: {
      state: {
        closed: 'pointer-events-none opacity-0',
        open: 'opacity-100',
      },
      variant: {
        modal:
          'top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[min(37.5rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl',
        panel: 'top-0 right-0 h-dvh w-[min(27.5rem,100vw)] rounded-l-2xl',
      },
    },
  }
);

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

/**
 * ## Surface.Content
 *
 * @description
 * Surface의 실제 컨테이너를 렌더링합니다. `Surface`의 `variant`에 따라 중앙 모달 또는
 * 우측 패널 레이아웃을 적용합니다.
 *
 * ### 주요 내용
 *
 * ESC 닫기, 외부 클릭 닫기, Focus Trap, Focus Restore, Scroll Lock을 이 컴포넌트에서
 * 연결합니다. dismiss 닫기 가능 여부는 Surface의 `canClose`, `closeOnEscape`,
 * `closeOnOutsideClick` 정책을 따릅니다.
 *
 * ### 접근성
 *
 * `role="dialog"`를 렌더링합니다. 접근성 이름은 `aria-label` 또는 `aria-labelledby`로
 * 명시합니다.
 * Modal variant에서는 `aria-modal`을 적용합니다.
 */
export function SurfaceContent({
  children,
  className,
  onPointerDown,
  ref,
  ...props
}: SurfaceContentProps) {
  const { actions, meta, state } = useSurfaceContext();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const setContentRef = useCallback(
    (element: HTMLDivElement | null) => {
      contentRef.current = element;
      assignRef(ref, element);
    },
    [ref]
  );

  useSurfaceInteractions({ actions, contentRef, meta, state });

  if (!state.isOpen) {
    return null;
  }

  return (
    <div
      {...props}
      aria-modal={state.variant === 'modal' ? true : undefined}
      className={cn(
        surfaceContentVariants({
          state: state.isOpen ? 'open' : 'closed',
          variant: state.variant,
        }),
        className
      )}
      data-state={state.isOpen ? 'open' : 'closed'}
      id={meta.contentId}
      onPointerDown={onPointerDown}
      ref={setContentRef}
      role="dialog"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
