import { createContext, use } from 'react';

import type { SurfaceContextValue } from './Surface.types';

const SurfaceContext = createContext<SurfaceContextValue | null>(null);

/**
 * ## useSurfaceContext
 *
 * @description
 * Surface compound 하위 컴포넌트가 Surface의 상태, 액션, 접근성 id를 읽는 내부 hook입니다.
 * Surface 밖에서 사용하면 명확한 에러를 발생시켜 잘못된 조합을 빠르게 확인할 수 있습니다.
 */
function useSurfaceContext() {
  const context = use(SurfaceContext);

  if (!context) {
    throw new Error('Surface compound components must be used within Surface.');
  }

  return context;
}

export { SurfaceContext, useSurfaceContext };
