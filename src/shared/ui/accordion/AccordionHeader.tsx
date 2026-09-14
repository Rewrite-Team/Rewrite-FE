'use client';

import { cn } from '@/shared/styles/utils/cn';

import { useAccordionContext } from './AccordionContext';

import type { AccordionHeaderProps } from './Accordion.types';

/**
 * ## Accordion.Header
 *
 * @description
 * Trigger와 닫힌 상태에서도 노출할 요약 입력 영역을 하나의 헤더로 묶는 선택적 Compound
 * 컴포넌트입니다.
 * 질문 input처럼 항상 보여야 하는 필드가 있을 때 사용합니다.
 *
 * ### 접근성
 *
 * Header 자체는 상호작용 요소가 아닙니다.
 * 열림/닫힘 동작은 내부의 `Accordion.Trigger`가 담당하며, input과 button 같은 요소는
 * Trigger 밖에 배치해야 합니다.
 */
export function AccordionHeader({ children, className, ...props }: AccordionHeaderProps) {
  const { disabled, isOpen } = useAccordionContext();

  return (
    <div
      {...props}
      className={cn(isOpen ? 'pb-8' : undefined, className)}
      data-disabled={disabled || undefined}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
    </div>
  );
}
