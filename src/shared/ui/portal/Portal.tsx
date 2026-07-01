'use client';

import { createPortal } from 'react-dom';

import { PORTAL_ROOT_ID } from '@/shared/constants/portal';

import type { PortalContainer, PortalProps } from './Portal.types';

const getDefaultPortalContainer = (): PortalContainer | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.getElementById(PORTAL_ROOT_ID) ?? document.body;
};

/**
 * ## Portal
 *
 * @description
 * Portal 기반 공통 UI가 동일한 렌더링 root를 사용하도록 portal 생성 로직을 중앙화합니다.
 *
 * ### 주요 내용
 *
 * 기본 대상은 `layout.tsx`에서 제공하는 앱 전역 Portal Root입니다.
 * Storybook, 테스트처럼 Root가 없는 환경에서는 `document.body`를 fallback으로 사용합니다.
 *
 * @param container - 직접 지정할 portal 대상 요소입니다. `null`이면 렌더링하지 않습니다.
 */
export function Portal({ children, container }: PortalProps) {
  const portalContainer = container === undefined ? getDefaultPortalContainer() : container;

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}
