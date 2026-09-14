'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { getDefaultPortalContainer } from '@/shared/ui/portal';

import type { SurfacePortalProps } from './Surface.types';

/**
 * ## Surface.Portal
 *
 * @description
 * Surface 하위 UI를 앱 전역 Portal Root 또는 지정한 container로 portal 렌더링합니다.
 *
 * ### 주요 내용
 *
 * 기본적으로 Surface가 열려 있을 때만 children을 렌더링합니다.
 *
 * @param container - portal을 렌더링할 대상 요소입니다. 생략하면 앱 전역 Portal Root를 사용하고,
 * `null`이면 렌더링하지 않습니다.
 */
export function SurfacePortal({ children, container }: SurfacePortalProps) {
  const portalContainer = container === undefined ? getDefaultPortalContainer() : container;

  if (!portalContainer) {
    return null;
  }

  return <BaseDialog.Portal container={portalContainer}>{children}</BaseDialog.Portal>;
}
