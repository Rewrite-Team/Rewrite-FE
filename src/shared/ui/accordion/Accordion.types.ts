import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
} from 'react';

/** Accordion Root가 공유하는 공통 props입니다. */
interface AccordionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

/** Trigger와 항상 노출할 요약 영역을 함께 묶는 Header props입니다. */
interface AccordionHeaderProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

interface AccordionLabelChildProps {
  className?: string;
  id?: string;
}

type AccordionLabelBaseProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'id'>;

/** Content region의 접근성 이름으로 연결되는 섹션 Label props입니다. */
type AccordionLabelProps =
  | (AccordionLabelBaseProps & {
      asChild?: false;
      children: ReactNode;
    })
  | (AccordionLabelBaseProps & {
      asChild: true;
      children: ReactElement<AccordionLabelChildProps>;
    });

/** 섹션을 열고 닫는 button 기반 Trigger props입니다. */
interface AccordionTriggerProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'aria-controls' | 'aria-expanded' | 'children' | 'disabled' | 'type'
> {
  'aria-label': string;
}

/** 열림 상태에 따라 확장되는 Content 영역 props입니다. */
interface AccordionContentProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

/** Root가 Compound 하위 컴포넌트에 제공하는 상태와 동작입니다. */
interface AccordionContextValue {
  contentId: string;
  disabled: boolean;
  isLockedOpen: boolean;
  isOpen: boolean;
  labelId: string;
  triggerId: string;
  toggleOpen: () => void;
}

export type {
  AccordionContentProps,
  AccordionContextValue,
  AccordionHeaderProps,
  AccordionLabelChildProps,
  AccordionLabelProps,
  AccordionProps,
  AccordionTriggerProps,
};
