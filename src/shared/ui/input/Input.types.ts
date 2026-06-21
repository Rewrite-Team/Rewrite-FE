import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';

/**
 * 공통 Input이 보장하는 입력 타입입니다.
 *
 * 다른 HTML input 타입이 필요하면 사용 사례와 UI 상태를 검토한 뒤 명시적으로 확장합니다.
 */
type InputType = 'text' | 'number' | 'url';

/**
 * Compound Input 전체에서 공유하는 상태입니다.
 *
 * `id`는 실제 input 요소에 적용되며 Label과 ErrorMessage의 접근성 연결에도
 * 사용됩니다. DOM wrapper에 별도 id가 필요하면 `containerId`를 사용합니다.
 */
interface InputProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id'> {
  children: ReactNode;
  containerId?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

/** Label은 Root가 제공하는 id와 required 상태를 상속합니다. */
interface InputLabelProps extends Omit<ComponentPropsWithoutRef<'label'>, 'htmlFor'> {
  children: ReactNode;
}

/** Field와 Button 같은 부가 동작을 나란히 합성하는 레이아웃 컨테이너입니다. */
interface InputControlProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

/**
 * 실제 input 요소의 props입니다.
 *
 * 접근성 및 공통 상태는 Root에서 관리합니다. React Hook Form이 제공하는 `name`, `value`,
 * `onChange`, `onBlur`, `ref` 등 나머지 네이티브 input props는 그대로 전달할 수 있습니다.
 */
interface InputFieldProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'aria-describedby' | 'aria-invalid' | 'disabled' | 'id' | 'readOnly' | 'required' | 'type'
> {
  type?: InputType;
}

/** 유효성 검증 오류를 표시하는 문구입니다. */
interface InputErrorMessageProps extends Omit<ComponentPropsWithoutRef<'p'>, 'id'> {
  children?: ReactNode;
}

/** Compound 하위 컴포넌트가 Root에서 전달받는 내부 계약입니다. */
interface InputContextValue {
  disabled: boolean;
  errorMessageId: string;
  fieldId: string;
  invalid: boolean;
  readOnly: boolean;
  required: boolean;
}

export type {
  InputContextValue,
  InputControlProps,
  InputErrorMessageProps,
  InputFieldProps,
  InputLabelProps,
  InputProps,
  InputType,
};
