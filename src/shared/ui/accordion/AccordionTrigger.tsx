'use client';

import { AltArrowDownIcon } from '@/shared/assets/icons/common';
import { cn } from '@/shared/styles/utils/cn';

import { useAccordionContext } from './AccordionContext';

import type { AccordionTriggerProps } from './Accordion.types';

/**
 * ## Accordion.Trigger
 *
 * @description
 * Accordion 섹션을 열고 닫는 아이콘 button 컴포넌트입니다.
 * Header 안에서 Label과 함께 배치해 섹션의 조작 지점을 만듭니다.
 *
 * ### 접근성
 *
 * 아이콘만 렌더링하는 button이므로 `aria-label`을 필수로 전달해야 합니다.
 * `aria-expanded`와 `aria-controls`는 자동으로 설정해 Content와 연결합니다.
 * input이나 button 같은 요소는 Trigger 안에 넣지 말고 `Accordion.Header`에서 Trigger 밖에
 * 배치합니다.
 *
 */
export function AccordionTrigger({ className, onClick, ref, ...props }: AccordionTriggerProps) {
  const { contentId, disabled, isLockedOpen, isOpen, toggleOpen, triggerId } =
    useAccordionContext();
  const isInteractionDisabled = disabled || isLockedOpen;

  const handleClick: NonNullable<AccordionTriggerProps['onClick']> = (event) => {
    onClick?.(event);

    if (event.defaultPrevented || isInteractionDisabled) {
      return;
    }

    toggleOpen();
  };

  return (
    <button
      {...props}
      aria-controls={contentId}
      aria-disabled={isInteractionDisabled || undefined}
      aria-expanded={isOpen}
      className={cn(
        'group inline-flex size-6 shrink-0 items-center justify-center bg-transparent p-0 text-gray-50 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        disabled ? 'text-gray-400' : undefined,
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      disabled={disabled}
      id={triggerId}
      onClick={handleClick}
      ref={ref}
      type="button"
    >
      <AltArrowDownIcon
        aria-hidden="true"
        className={cn(
          'size-6 shrink-0 text-current transition-transform duration-200',
          isOpen ? 'rotate-0' : '-rotate-90',
          !disabled && 'group-hover:text-primary-500'
        )}
      />
    </button>
  );
}
