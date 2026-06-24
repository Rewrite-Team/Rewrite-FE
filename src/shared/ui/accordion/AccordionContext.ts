import { createContext, use } from 'react';

import type { AccordionContextValue } from './Accordion.types';

const AccordionContext = createContext<AccordionContextValue | null>(null);

/**
 * ## useAccordionContext
 *
 * @description
 * Accordion Root가 제공하는 열림 상태, 연결 id, 토글 동작을 읽는 내부 훅입니다.
 * Compound 하위 컴포넌트가 Root 밖에서 사용되는 실수를 빠르게 드러내기 위해 context가
 * 없으면 명시적인 에러를 발생시킵니다.
 */
export function useAccordionContext() {
  const context = use(AccordionContext);

  if (!context) {
    throw new Error('Accordion compound components must be used within Accordion.');
  }

  return context;
}

export { AccordionContext };
