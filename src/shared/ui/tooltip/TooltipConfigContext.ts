import { createContext, use } from 'react';

import type { TooltipPlacement } from './Tooltip.types';

interface TooltipConfigContextValue {
  offset: number;
  placement: TooltipPlacement;
}

const TooltipConfigContext = createContext<TooltipConfigContextValue | null>(null);

/**
 * ## useTooltipConfigContext
 *
 * @description
 * Tooltip 하위 컴포넌트에서 Root의 배치 설정을 읽습니다.
 */
function useTooltipConfigContext() {
  const context = use(TooltipConfigContext);

  if (!context) {
    throw new Error('Tooltip compound components must be used within Tooltip.Root.');
  }

  return context;
}

export { TooltipConfigContext, useTooltipConfigContext };
export type { TooltipConfigContextValue };
