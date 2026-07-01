import type { ReactNode } from 'react';

/** Portal이 렌더링될 수 있는 DOM container 타입입니다. */
type PortalContainer = DocumentFragment | Element;

/** Portal props입니다. */
interface PortalProps {
  children: ReactNode;
  /** portal을 렌더링할 대상 요소입니다. 생략하면 앱 전역 Portal Root를 사용합니다. */
  container?: PortalContainer | null;
}

export type { PortalContainer, PortalProps };
