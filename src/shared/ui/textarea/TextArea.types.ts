import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';

/**
 * Compound TextArea 전체에서 공유하는 상태입니다.
 *
 * `id`는 실제 textarea에 적용되며 Label, 글자 수, ErrorMessage의 접근성 연결에
 * 사용됩니다. DOM wrapper에 별도 id가 필요하면 `containerId`를 사용합니다.
 */
interface TextAreaProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id'> {
  children: ReactNode;
  containerId?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  required?: boolean;
}

/**
 * 실제 textarea가 지원하는 공통 props입니다.
 *
 * 접근성 및 공통 상태는 Root에서 관리합니다. React Hook Form의 `name`, `value`,
 * `onChange`, `onBlur`, `ref`를 포함한 나머지 네이티브 textarea props를 전달할 수 있습니다.
 */
interface TextAreaFieldBaseProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'aria-invalid'
  | 'children'
  | 'disabled'
  | 'id'
  | 'maxLength'
  | 'required'
> {
  /** 현재 글자 수와 선택한 길이 기준의 표시 여부입니다. */
  showCount?: boolean;
}

/**
 * TextArea의 글자 수 기준입니다.
 *
 * `maxLength`는 입력을 실제로 제한하고 `recommendedLength`는 초과 입력을 허용합니다.
 * 두 기준은 동작이 다르므로 동시에 전달할 수 없습니다.
 */
type TextAreaLengthProps =
  | { maxLength: number; recommendedLength?: never }
  | { maxLength?: never; recommendedLength: number }
  | { maxLength?: undefined; recommendedLength?: undefined };

/** 실제 textarea 요소의 네이티브 props와 글자 수 기준을 결합한 Field props입니다. */
type TextAreaFieldProps = TextAreaFieldBaseProps & TextAreaLengthProps;

/** Label은 Root가 제공하는 id와 required 상태를 상속합니다. */
interface TextAreaLabelProps extends Omit<ComponentPropsWithoutRef<'label'>, 'htmlFor'> {
  children: ReactNode;
}

/** Root가 invalid일 때 유효성 검증 오류를 표시하는 문구입니다. */
interface TextAreaErrorMessageProps extends Omit<ComponentPropsWithoutRef<'p'>, 'id'> {
  children?: ReactNode;
}

export type { TextAreaErrorMessageProps, TextAreaFieldProps, TextAreaLabelProps, TextAreaProps };
