'use client';

import { Children, cloneElement, isValidElement } from 'react';
import type { ReactElement } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import { useAccordionContext } from './AccordionContext';

import type { AccordionLabelChildProps, AccordionLabelProps } from './Accordion.types';

/**
 * ## Accordion.Label
 *
 * @description
 * Accordion Content region의 접근성 이름으로 연결되는 섹션 Label입니다.
 * `Accordion.Content`가 `aria-labelledby`로 참조할 id를 자동으로 적용합니다.
 * 실제 입력 필드의 Label이 섹션 제목이기도 한 경우 `asChild`로 `Input.Label` 또는
 * `TextArea.Label`을 전달합니다.
 *
 * @param asChild - 자식 컴포넌트에 Accordion Label 속성을 위임할지 여부
 * @param children - Accordion 섹션 제목
 * @param className - Label의 기본 스타일을 확장하는 클래스 이름
 */
export function AccordionLabel({
  asChild = false,
  children,
  className,
  ...props
}: AccordionLabelProps) {
  const { labelId } = useAccordionContext();
  const labelClassName = cn('mb-0 w-fit body-18 font-semibold text-current', className);

  if (asChild) {
    const childCount = Children.count(children);

    if (childCount !== 1) {
      throw new Error('Accordion.Label with asChild must receive exactly one React element child.');
    }

    const child = Children.only(children);

    if (!isValidElement<AccordionLabelChildProps>(child)) {
      throw new Error('Accordion.Label with asChild must receive a valid React element child.');
    }

    return cloneElement(child as ReactElement<AccordionLabelChildProps>, {
      ...(props as AccordionLabelChildProps),
      className: cn(labelClassName, child.props.className),
      id: labelId,
    });
  }

  return (
    <span {...props} className={labelClassName} id={labelId}>
      {children}
    </span>
  );
}
