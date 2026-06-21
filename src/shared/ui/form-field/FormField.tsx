'use client';

import { Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import type { FormFieldProps } from './FormField.types';

/**
 * ## FormField
 *
 * @description
 * React Hook Form의 `Controller` 상태를 공통 UI가 사용하기 쉬운 형태로 전달하는 adapter입니다.
 * 네이티브 register만으로 연결하기 어렵거나 유효성 상태를 UI와 조합해야 하는 필드에 사용합니다.
 *
 * ### 주요 내용
 *
 * Controller의 `field`, `fieldState`, `formState`를 유지하면서 `invalid`와 `errorMessage`를
 * 편의 값으로 제공합니다. 유효성 검증 규칙과 실제 UI 구성은 사용하는 feature에서 결정합니다.
 *
 * ### 주의할 점
 *
 * React Hook Form이 submit 검증을 담당하는 폼에는 브라우저 기본 검증과 중복되지 않도록
 * `<form noValidate>`를 사용합니다. `field`의 ref와 이벤트 props는 실제 입력 요소에 전달합니다.
 *
 * @param control - `useForm`에서 생성한 React Hook Form control
 * @param name - 폼 값 타입에 포함된 Field 경로
 * @param rules - 사용하는 feature에서 정의한 유효성 검증 규칙
 * @param render - Field 상태를 받아 실제 입력 UI를 구성하는 함수
 *
 * @example
 * ```tsx
 * <FormField
 *   control={control}
 *   name="title"
 *   rules={{ required: '제목을 입력해 주세요.' }}
 *   render={({ field, invalid, errorMessage }) => (
 *     <Input invalid={invalid} required>
 *       <Input.Label>자기소개서 제목</Input.Label>
 *       <Input.Field {...field} />
 *       <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
 *     </Input>
 *   )}
 * />
 * ```
 */
export default function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ render, ...controllerProps }: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState, formState }) =>
        render({
          errorMessage: fieldState.error?.message,
          field,
          fieldState,
          formState,
          invalid: fieldState.invalid,
        })
      }
    />
  );
}
