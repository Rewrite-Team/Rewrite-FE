'use client';

import { cn } from '@/shared/styles/utils/cn';

import { useAccordionContext } from './AccordionContext';

import type { AccordionContentProps } from './Accordion.types';

/**
 * ## Accordion.Content
 *
 * @description
 * Accordion 섹션이 열렸을 때 표시되는 본문 영역입니다. Input, TextArea, 안내 문구 등
 * 섹션 안의 실제 콘텐츠를 children으로 배치합니다.
 *
 * ### 접근성
 *
 * Header의 보이는 Label과 `aria-labelledby`로 연결된 `region`을 렌더링합니다. 닫힌 상태에서는
 * `aria-hidden`과 `inert`를 적용해 스크린 리더와 키보드 탐색에서 제외하면서도 높이
 * 애니메이션이 자연스럽게 동작하도록 DOM은 유지합니다.
 */
export function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const { contentId, isOpen, labelId } = useAccordionContext();

  return (
    <div
      {...props}
      aria-hidden={!isOpen || undefined}
      aria-labelledby={labelId}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        isOpen ? 'opacity-100' : 'opacity-0',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      id={contentId}
      inert={!isOpen ? true : undefined}
      role="region"
    >
      <div className="min-h-0 overflow-hidden">
        <div className="flex flex-col gap-8">{children}</div>
      </div>
    </div>
  );
}
