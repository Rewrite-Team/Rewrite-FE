import { createContext, use } from 'react';

import type { TooltipContextValue } from './Tooltip.types';

const TooltipContext = createContext<TooltipContextValue | null>(null);

/**
 * ## useTooltipContext
 *
 * @description
 * Tooltip compound 하위 컴포넌트가 Root에서 관리하는 상태, 액션, 접근성 id를 읽는
 * 내부 hook입니다.
 *
 * ### 사용 범위
 *
 * 이 hook은 `Tooltip.Trigger`, `Tooltip.Content`, `Tooltip.Arrow` 구현 내부에서만 사용합니다.
 */
function useTooltipContext() {
  const context = use(TooltipContext);

  if (!context) {
    throw new Error('Tooltip compound components must be used within Tooltip.Root.');
  }

  return context;
}

export { TooltipContext, useTooltipContext };
