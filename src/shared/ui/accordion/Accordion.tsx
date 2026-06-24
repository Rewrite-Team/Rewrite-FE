'use client';

import { useCallback, useId, useMemo, useState } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import { AccordionContent } from './AccordionContent';
import { AccordionContext } from './AccordionContext';
import { AccordionHeader } from './AccordionHeader';
import { AccordionLabel } from './AccordionLabel';
import { AccordionTrigger } from './AccordionTrigger';

import type { AccordionContextValue, AccordionProps } from './Accordion.types';

/**
 * ## Accordion
 *
 * @description
 * 하나의 입력 섹션을 접고 펼칠 때 사용하는 공통 Compound Accordion입니다.
 * 자기소개서 문항, 수정본, 키워드 분석 입력처럼 사용자가 필요한 영역에 집중해야 하는
 * 화면에서 사용합니다.
 *
 * ### 주요 내용
 *
 * `open`을 전달하면 controlled 방식으로 동작하고, 생략하면 `defaultOpen`을 기준으로
 * 내부 상태를 관리합니다. 여러 Accordion 중 하나만 열어야 하는 정책은 페이지나 부모
 * 컴포넌트에서 `open`과 `onOpenChange`로 제어합니다.
 *
 * ### 구조
 *
 * Header 조합 Accordion:
 *
 * ```tsx
 * <Accordion defaultOpen>
 *   <Accordion.Header>
 *     <Input id="question" required>
 *       <div className="flex items-center gap-2">
 *         <Accordion.Trigger aria-label="질문 영역 접기/펼치기" />
 *         <Accordion.Label asChild>
 *           <Input.Label>질문</Input.Label>
 *         </Accordion.Label>
 *       </div>
 *       <Input.Field />
 *     </Input>
 *   </Accordion.Header>
 *   <Accordion.Content>...</Accordion.Content>
 * </Accordion>
 * ```
 *
 * @param open - 외부에서 열림 상태를 제어할 때 사용하는 controlled 값
 * @param defaultOpen - uncontrolled 방식에서 최초로 열어둘지 여부
 * @param onOpenChange - 열림 상태가 바뀔 때 호출되는 콜백
 * @param collapsible - 열린 Accordion을 다시 닫을 수 있는지 여부
 * @param disabled - Trigger 동작을 비활성화할지 여부
 *
 * @example 기본 입력 섹션
 * ```tsx
 * <Accordion defaultOpen>
 *   <Accordion.Header>
 *     <Input id="question" required>
 *       <div className="flex items-center gap-2">
 *         <Accordion.Trigger aria-label="질문 영역 접기/펼치기" />
 *         <Accordion.Label asChild>
 *           <Input.Label>질문</Input.Label>
 *         </Accordion.Label>
 *       </div>
 *       <Input.Field />
 *     </Input>
 *   </Accordion.Header>
 *   <Accordion.Content>
 *     <TextArea>
 *       <TextArea.Label>자기소개서 내용</TextArea.Label>
 *       <TextArea.Field />
 *     </TextArea>
 *   </Accordion.Content>
 * </Accordion>
 * ```
 *
 * @example controlled Accordion
 * ```tsx
 * <Accordion open={isOpen} onOpenChange={setIsOpen}>
 *   <Accordion.Header>
 *     <Accordion.Trigger aria-label="답변 영역 접기/펼치기" />
 *     <Accordion.Label>답변</Accordion.Label>
 *   </Accordion.Header>
 *   <Accordion.Content>
 *     <TextArea>
 *       <TextArea.Label>자기소개서 내용</TextArea.Label>
 *       <TextArea.Field />
 *     </TextArea>
 *   </Accordion.Content>
 * </Accordion>
 * ```
 */
function AccordionRoot({
  children,
  className,
  collapsible = true,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open,
  ...props
}: AccordionProps) {
  const generatedId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      contentId: `accordion-content-${generatedId}`,
      disabled,
      isLockedOpen: isOpen && !collapsible,
      isOpen,
      labelId: `accordion-label-${generatedId}`,
      triggerId: `accordion-trigger-${generatedId}`,
      toggleOpen: () => {
        if (disabled || (isOpen && !collapsible)) {
          return;
        }

        handleOpenChange(!isOpen);
      },
    }),
    [collapsible, disabled, generatedId, handleOpenChange, isOpen]
  );

  return (
    <AccordionContext value={contextValue}>
      <div
        {...props}
        className={cn('flex w-full flex-col overflow-hidden rounded-lg bg-gray-800 p-6', className)}
        data-disabled={disabled || undefined}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
      </div>
    </AccordionContext>
  );
}

const Accordion = Object.assign(AccordionRoot, {
  Content: AccordionContent,
  Header: AccordionHeader,
  Label: AccordionLabel,
  Trigger: AccordionTrigger,
});

export { Accordion };
