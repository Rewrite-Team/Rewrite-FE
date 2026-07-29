'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cva } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceContentProps } from './Surface.types';

const surfaceContentVariants = cva(
  'fixed z-(--z-index-surface-content) flex flex-col overflow-hidden bg-gray-800 text-white shadow-2xl outline-none',
  {
    variants: {
      variant: {
        modal:
          'surface-modal-animation top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[min(37.5rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl data-closed:pointer-events-none',
        panel:
          'top-0 right-0 h-dvh w-[min(27.5rem,100vw)] rounded-l-2xl transition-opacity duration-150 data-closed:pointer-events-none data-closed:opacity-0 data-open:opacity-100',
      },
    },
  }
);

/**
 * ## Surface.Content
 *
 * @description
 * Surface의 실제 컨테이너를 렌더링합니다. `Surface`의 `variant`에 따라 중앙 모달 또는
 * 우측 패널 레이아웃을 적용합니다.
 *
 * ### 주요 내용
 *
 * Base UI Dialog Popup을 사용해 ESC, 외부 클릭, Focus Trap, Focus Restore,
 * Scroll Lock을 처리합니다. dismiss 닫기 가능 여부는 Surface의 정책을 따릅니다.
 *
 * ### 접근성
 *
 * `role="dialog"`를 렌더링합니다. 접근성 이름은 `aria-label` 또는 `aria-labelledby`로
 * 명시합니다.
 * 배경 상호작용을 제한하는 modal 동작일 때만 `aria-modal`을 적용합니다.
 */
export function SurfaceContent({ children, className, ref, ...props }: SurfaceContentProps) {
  const { config } = useSurfaceContext();

  return (
    <BaseDialog.Popup
      {...props}
      aria-modal={config.isAriaModal ? true : undefined}
      className={cn(surfaceContentVariants({ variant: config.variant }), className)}
      finalFocus={config.restoreFocus}
      initialFocus={config.focusTrap ? undefined : false}
      ref={ref}
    >
      {children}
    </BaseDialog.Popup>
  );
}
