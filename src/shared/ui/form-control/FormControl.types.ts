import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** Input과 TextArea Root가 Label, Field, ErrorMessage에 제공하는 공통 상태입니다. */
interface FormControlState {
  disabled: boolean;
  errorMessageId: string;
  fieldId: string;
  invalid: boolean;
  required: boolean;
}

/** FormControl 하위 컴포넌트가 공유하는 상태와 ErrorMessage 등록 동작입니다. */
interface FormControlContextValue extends FormControlState {
  hasErrorMessage: boolean;
  registerErrorMessage: () => () => void;
}

/** ErrorMessage 등록 상태를 관리하는 내부 Provider props입니다. */
interface FormControlProviderProps {
  children: ReactNode;
  value: FormControlState;
}

/** Root의 fieldId와 required 상태를 상속하는 공통 Label props입니다. */
interface FormControlLabelProps extends Omit<ComponentPropsWithoutRef<'label'>, 'htmlFor'> {
  children: ReactNode;
}

/** Root의 invalid 상태와 errorMessageId를 상속하는 공통 오류 문구 props입니다. */
interface FormControlErrorMessageProps extends Omit<ComponentPropsWithoutRef<'p'>, 'id'> {
  children?: ReactNode;
}

export type {
  FormControlContextValue,
  FormControlErrorMessageProps,
  FormControlLabelProps,
  FormControlProviderProps,
  FormControlState,
};
