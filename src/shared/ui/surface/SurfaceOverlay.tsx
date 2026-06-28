'use client';

import { cn } from '@/shared/styles/utils/cn';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceOverlayProps } from './Surface.types';

/**
 * ## Surface.Overlay
 *
 * @description
 * `variant="modal"`에서 배경을 덮는 overlay입니다.
 *
 * ### 주요 내용
 *
 * Panel variant에서는 overlay가 필요 없으므로 렌더링하지 않습니다. Modal variant에서는
 * Content 뒤에 배치해 배경과 현재 Surface를 시각적으로 분리합니다.
 */
export function SurfaceOverlay({ className, ref, ...props }: SurfaceOverlayProps) {
  const { state } = useSurfaceContext();

  if (state.variant === 'panel' || !state.isOpen) {
    return null;
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-(--z-index-surface-overlay) bg-black/70 transition-opacity duration-150',
        className
      )}
      data-state={state.isOpen ? 'open' : 'closed'}
      ref={ref}
    />
  );
}
