import { cn } from '@/shared/styles/utils/cn';
import { useFormControlContext } from '@/shared/ui/form-control/FormControlContext';
import {
  fieldBaseClassName,
  fieldInteractionClassName,
} from '@/shared/ui/form-control/formControlStyles';

import type { InputFieldProps } from './Input.types';

/**
 * ## Input.Field
 *
 * @description
 * 실제 HTML `input`을 렌더링하는 Compound Input의 입력 요소입니다.
 * `text`, `number`, `url` 타입을 지원하며 나머지 네이티브 input props를 전달할 수 있습니다.
 *
 * ### 주요 내용
 *
 * Root의 id와 상태를 상속하고 React 19의 일반 `ref` prop을 지원합니다. React Hook Form의
 * `field` 객체도 그대로 전달할 수 있습니다.
 *
 * ### 접근성
 *
 * Root 상태에 따라 `required`, `aria-invalid`, `aria-errormessage`를 설정합니다.
 * 접근성 이름은 함께 구성한 `Input.Label`에서 제공받습니다.
 *
 * @param type - 지원하는 입력 타입. 기본값은 `text`
 * @param ref - Field DOM 요소에 접근하거나 폼 라이브러리와 연결하는 ref
 * @param className - Field의 기본 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Input.Field type="url" placeholder="https://example.com" />
 * ```
 */
export function InputField({ className, ref, type = 'text', ...props }: InputFieldProps) {
  const { disabled, errorMessageId, fieldId, hasErrorMessage, invalid, required } =
    useFormControlContext();
  const ariaErrorMessageId = invalid && hasErrorMessage ? errorMessageId : undefined;

  return (
    <input
      {...props}
      aria-errormessage={ariaErrorMessageId}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-16.75',
        fieldBaseClassName,
        fieldInteractionClassName,
        'autofill:[-webkit-text-fill-color:var(--color-white)] autofill:caret-white',
        'autofill:[transition:background-color_9999s_ease-out_0s]',
        className
      )}
      data-invalid={invalid || undefined}
      disabled={disabled}
      id={fieldId}
      ref={ref}
      required={required}
      type={type}
    />
  );
}
