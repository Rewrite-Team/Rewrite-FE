import type { ReactElement } from 'react';

import type {
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from 'react-hook-form';

/**
 * FormField의 render 함수에 전달하는 React Hook Form 상태입니다.
 *
 * Controller의 원본 상태를 유지하면서 공통 UI가 바로 사용할 수 있도록 `invalid`와
 * `errorMessage`를 편의 값으로 제공합니다.
 */
interface FormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  /** 현재 Field의 validation 오류 메시지입니다. */
  errorMessage?: string;
  /** 실제 입력 요소에 전달할 name, value, 이벤트 핸들러, ref입니다. */
  field: ControllerRenderProps<TFieldValues, TName>;
  /** touched, dirty, invalid 등 현재 Field 단위 상태입니다. */
  fieldState: ControllerFieldState;
  /** submit, validating 등 폼 전체 상태입니다. */
  formState: UseFormStateReturn<TFieldValues>;
  /** 현재 Field에 validation 오류가 있는지 나타내는 편의 값입니다. */
  invalid: boolean;
}

/**
 * React Hook Form의 Controller props를 사용하는 공통 FormField adapter 타입입니다.
 *
 * Controller의 기본 `render` 대신 공통 UI에 필요한 편의 값이 포함된
 * `FormFieldRenderProps`를 전달하는 render 함수를 사용합니다.
 */
type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = Omit<
  ControllerProps<TFieldValues, TName>,
  'render'
> & {
  render: (props: FormFieldRenderProps<TFieldValues, TName>) => ReactElement;
};

export type { FormFieldProps, FormFieldRenderProps };
