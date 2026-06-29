'use client';

import type { RefObject } from 'react';

import {
  useEscapeKey,
  useFocusRestore,
  useFocusTrap,
  useOutsideClick,
  useScrollLock,
} from '@/shared/hooks';

import { useSurfaceStack } from './useSurfaceStack';

import type { SurfaceActions, SurfaceMeta, SurfaceState } from '../Surface.types';

interface UseSurfaceInteractionsParams {
  actions: SurfaceActions;
  contentRef: RefObject<HTMLDivElement | null>;
  meta: SurfaceMeta;
  state: SurfaceState;
}

/**
 * Surface Content가 열려 있는 동안 필요한 전역 interaction을 연결합니다.
 *
 * @description
 * ESC 닫기, outside click 닫기, focus trap, focus restore, scroll lock을 한곳에서 관리합니다.
 * 중첩 Surface에서는 최상단 Surface만 ESC/outside/focus trap에 반응합니다.
 */
function useSurfaceInteractions({
  actions,
  contentRef,
  meta,
  state,
}: UseSurfaceInteractionsParams) {
  const isTopSurface = useSurfaceStack(meta.contentId, state.isOpen);

  useEscapeKey({
    enabled: state.isOpen && isTopSurface,
    onEscapeKeyDown: () => actions.close('escape-key'),
  });

  useOutsideClick({
    enabled: state.isOpen && isTopSurface,
    onOutsideClick: (event) => {
      const target = event.target;
      const trigger = target instanceof Element ? target.closest('[data-surface-trigger]') : null;

      if (trigger?.getAttribute('data-surface-trigger') === meta.contentId) {
        return;
      }

      actions.close('outside-click');
    },
    ref: contentRef,
  });

  useFocusRestore({
    enabled: state.isOpen && state.restoreFocus,
  });

  useFocusTrap({
    enabled: state.isOpen && state.focusTrap && isTopSurface,
    ref: contentRef,
  });

  useScrollLock({
    enabled: state.isOpen && state.scrollLock,
  });
}

export { useSurfaceInteractions };
