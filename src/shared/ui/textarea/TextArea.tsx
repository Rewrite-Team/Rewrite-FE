'use client';

import { useId } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import type { FormControlContextValue } from '@/shared/ui/form-control/FormControl.types';
import { FormControlContext } from '@/shared/ui/form-control/FormControlContext';

import { TextAreaErrorMessage } from './TextAreaErrorMessage';
import { TextAreaField } from './TextAreaField';
import { TextAreaLabel } from './TextAreaLabel';

import type { TextAreaProps } from './TextArea.types';

/**
 * ## TextArea
 *
 * @description
 * Label, Field, ErrorMessage를 조합해 긴 텍스트를 입력받는 공통 Compound TextArea입니다.
 * 자기소개서 답변, 우대사항처럼 여러 줄 입력이 필요한 폼에서 사용합니다.
 *
 * ### 주요 내용
 *
 * `required`, `disabled`, `invalid` 상태를 하위 컴포넌트에 전달합니다. `id`를 생략하면
 * 고유한 Field id를 생성하며 Label, 글자 수 안내, 오류 문구의 접근성 연결에 사용합니다.
 *
 * ### 접근성
 *
 * 입력 목적을 제공하는 `TextArea.Label`을 함께 사용합니다. 유효성 오류가 있으면
 * `invalid`를 전달하고 `TextArea.ErrorMessage`에 해결 가능한 오류 문구를 제공합니다.
 *
 * @example
 * ```tsx
 * <TextArea id="cover-letter-answer" invalid={invalid} required>
 *   <TextArea.Label>자기소개서 내용</TextArea.Label>
 *   <TextArea.Field
 *     recommendedLength={1000}
 *     showCount
 *     {...field}
 *   />
 *   <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
 * </TextArea>
 * ```
 */
function TextAreaRoot({
  children,
  className,
  containerId,
  disabled = false,
  id,
  invalid = false,
  required = false,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? `text-area-${generatedId}`;
  const contextValue: FormControlContextValue = {
    disabled,
    errorMessageId: `${fieldId}-error-message`,
    fieldId,
    invalid,
    required,
  };

  return (
    <FormControlContext value={contextValue}>
      <div
        {...props}
        className={cn('flex w-full flex-col', className)}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        id={containerId}
      >
        {children}
      </div>
    </FormControlContext>
  );
}

const TextArea = Object.assign(TextAreaRoot, {
  ErrorMessage: TextAreaErrorMessage,
  Field: TextAreaField,
  Label: TextAreaLabel,
});

export { TextArea };
