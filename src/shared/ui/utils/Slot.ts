import { Children, Fragment, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/shared/styles/utils/cn';

/**
 * UI compound 컴포넌트의 asChild 자식이 공통으로 받을 수 있는 props입니다.
 *
 * @description
 * Trigger, Close처럼 자식 요소에 동작을 위임하는 컴포넌트에서 className 병합을 공통 처리하기
 * 위해 사용하는 내부 타입입니다.
 */
interface SlotProps {
  className?: string;
}

/**
 * ## getSingleSlotChild
 *
 * asChild로 전달된 자식이 단일 React Element인지 검증합니다.
 *
 * @description
 * `React.Fragment`는 props 주입 대상 DOM이 명확하지 않으므로 명시적으로 거부합니다.
 *
 * @param children - asChild로 전달된 children
 * @param componentName - 에러 메시지에 표시할 compound 컴포넌트 이름
 * @returns props를 주입할 수 있는 단일 React Element
 */
const getSingleSlotChild = <TProps extends SlotProps>(
  children: ReactNode,
  componentName: string
) => {
  if (Children.count(children) !== 1) {
    throw new Error(`${componentName} with asChild must receive exactly one React element child.`);
  }

  const child = Children.only(children);

  if (!isValidElement<TProps>(child)) {
    throw new Error(`${componentName} with asChild must receive a valid React element child.`);
  }

  if (child.type === Fragment) {
    throw new Error(`${componentName} with asChild must not receive React.Fragment.`);
  }

  return child as ReactElement<TProps>;
};

/**
 * ## cloneSlot
 *
 * asChild 자식 요소에 compound 컴포넌트 동작 props를 병합합니다.
 *
 * @description
 * compound 컴포넌트의 `className` 뒤에 자식의 기존 `className`을 병합하여
 * 사용자가 전달한 자식 스타일이 override될 수 있게 합니다. 나머지 props는 compound
 * 컴포넌트 props가 우선하도록 주입합니다.
 *
 * @param child - props를 주입할 단일 React Element
 * @param props - compound 컴포넌트가 주입할 props
 * @returns props가 병합된 React Element
 */
const cloneSlot = <TProps extends SlotProps>(child: ReactElement<TProps>, props: Partial<TProps>) =>
  cloneElement(child, {
    ...props,
    className: cn(props.className, child.props.className),
  } as Partial<TProps>);

export { cloneSlot, getSingleSlotChild };
