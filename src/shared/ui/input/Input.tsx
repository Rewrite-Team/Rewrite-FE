'use client';

import { useId } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import { InputContext } from './InputContext';
import InputControl from './InputControl';
import InputErrorMessage from './InputErrorMessage';
import InputField from './InputField';
import InputLabel from './InputLabel';

import type { InputContextValue, InputProps } from './Input.types';

/**
 * ## Input
 *
 * @description
 * Label, Field, ErrorMessage를 필요한 순서로 조합하는 공통 Compound Input입니다.
 * 텍스트, 숫자, URL처럼 한 줄 값을 입력받는 폼에서 사용합니다.
 *
 * ### 주요 내용
 *
 * `required`, `disabled`, `invalid` 상태를 하위 컴포넌트에 Context로 전달합니다.
 * `id`를 생략하면 고유한 Field id를 생성하며 Label과 보조 문구의 접근성 연결에도 사용합니다.
 * Field 내부 오른쪽에 버튼이 필요하면 `Input.Control` 안에서 함께 구성합니다.
 *
 * ### 접근성
 *
 * 입력 목적을 알 수 있도록 `Input.Label`을 함께 사용합니다. 오류 상태에서는 `invalid`를
 * 전달하고 `Input.ErrorMessage`에 구체적인 해결 방법을 제공합니다.
 *
 * @param id - Field에 적용하고 Label 및 보조 문구 연결의 기준으로 사용하는 id
 * @param containerId - Field가 아닌 최상위 wrapper에 적용하는 id
 * @param required - 필수 입력 여부와 Label의 필수 표시를 제어하는 값
 * @param disabled - Field의 입력 및 포커스를 차단하는 값
 * @param invalid - 유효성 오류 스타일과 접근성 상태를 제어하는 값
 * @param className - 최상위 wrapper의 기본 스타일을 확장하는 클래스 이름
 *
 * @example 기본 text Input
 * ```tsx
 * <Input id="company-name">
 *   <Input.Label>회사명</Input.Label>
 *   <Input.Field placeholder="지원할 회사명을 입력해 주세요." />
 *   <Input.ErrorMessage>회사명을 입력해 주세요.</Input.ErrorMessage>
 * </Input>
 * ```
 *
 * @example 필수 URL Input
 * ```tsx
 * <Input id="job-url" required>
 *   <Input.Label>채용 공고 링크</Input.Label>
 *   <Input.Field type="url" placeholder="https://example.com/jobs/1" />
 *   <Input.ErrorMessage>올바른 URL을 입력해 주세요.</Input.ErrorMessage>
 * </Input>
 * ```
 *
 * @example 버튼을 포함한 number Input
 * ```tsx
 * <Input id="character-limit">
 *   <Input.Label>제한 글자 수</Input.Label>
 *   <Input.Control>
 *     <Input.Field type="number" min={0} placeholder="1000" />
 *     <Button size="sm" type="button">적용</Button>
 *   </Input.Control>
 *   <Input.ErrorMessage>0 이상의 글자 수를 입력해 주세요.</Input.ErrorMessage>
 * </Input>
 * ```
 *
 * @example 비활성화된 Input
 * ```tsx
 * <Input id="cover-letter-title" disabled>
 *   <Input.Label>자기소개서 제목</Input.Label>
 *   <Input.Field defaultValue="카카오 자기소개서" />
 *   <Input.ErrorMessage>자기소개서 제목을 입력해 주세요.</Input.ErrorMessage>
 * </Input>
 * ```
 */
function InputRoot({
  children,
  className,
  containerId,
  disabled = false,
  id,
  invalid = false,
  required = false,
  ...props
}: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? `input-${generatedId}`;
  const contextValue: InputContextValue = {
    disabled,
    errorMessageId: `${fieldId}-error-message`,
    fieldId,
    invalid,
    required,
  };

  return (
    <InputContext value={contextValue}>
      <div
        {...props}
        className={cn('flex w-full flex-col', className)}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        id={containerId}
      >
        {children}
      </div>
    </InputContext>
  );
}

const Input = Object.assign(InputRoot, {
  Control: InputControl,
  ErrorMessage: InputErrorMessage,
  Field: InputField,
  Label: InputLabel,
});

export default Input;
