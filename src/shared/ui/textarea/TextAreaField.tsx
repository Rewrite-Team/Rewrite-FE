import { useControllableState } from '@/shared/hooks';
import { cn } from '@/shared/styles/utils/cn';
import { useFormControlContext } from '@/shared/ui/form-control/FormControlContext';
import {
  fieldBaseClassName,
  fieldStateClassName,
} from '@/shared/ui/form-control/formControlStyles';

import type { TextAreaFieldProps } from './TextArea.types';

const getValueLength = (value: TextAreaFieldProps['value']) => String(value ?? '').length;

/**
 * ## TextArea.Field
 *
 * @description
 * 실제 HTML `textarea`를 렌더링하고 선택적으로 현재 글자 수를 표시합니다. 네이티브
 * `maxLength`는 입력을 제한하며 `recommendedLength`는 입력을 막지 않는 권장 기준입니다.
 *
 * ### 주요 내용
 *
 * controlled 값은 렌더링 중 길이를 계산하고 uncontrolled 값은 입력 이벤트에서 길이를
 * 갱신합니다. React Hook Form의 `field` 객체와 React 19의 일반 `ref` prop을 지원합니다.
 *
 * @param recommendedLength - 입력을 제한하지 않는 권장 글자 수
 * @param showCount - 현재 글자 수와 기준 글자 수 표시 여부
 * @param maxLength - 브라우저가 강제하는 최대 입력 글자 수
 */
export function TextAreaField({
  className,
  defaultValue,
  maxLength,
  onChange,
  recommendedLength,
  ref,
  showCount = false,
  value,
  ...props
}: TextAreaFieldProps) {
  const { disabled, errorMessageId, fieldId, hasErrorMessage, invalid, required } =
    useFormControlContext();
  const [currentLength, setCurrentLength] = useControllableState({
    defaultValue: () => getValueLength(defaultValue),
    value: value === undefined ? undefined : getValueLength(value),
  });
  const countId = `${fieldId}-character-count`;
  const ariaErrorMessageId = invalid && hasErrorMessage ? errorMessageId : undefined;
  const hasReachedMaxLength = maxLength !== undefined && currentLength >= maxLength;
  const hasExceededRecommendedLength =
    recommendedLength !== undefined && currentLength > recommendedLength;
  const countLimit = recommendedLength ?? maxLength;
  const hasExceededCountLimit = countLimit !== undefined && currentLength > countLimit;
  const isNearCountLimit =
    countLimit !== undefined && currentLength >= countLimit * 0.9 && !hasExceededCountLimit;

  const handleChange: NonNullable<TextAreaFieldProps['onChange']> = (event) => {
    const inputValue = event.currentTarget.value;
    const nextValue =
      maxLength !== undefined && inputValue.length > maxLength
        ? inputValue.slice(0, maxLength)
        : inputValue;

    if (inputValue !== nextValue) {
      event.currentTarget.value = nextValue;
    }

    setCurrentLength(nextValue.length);

    onChange?.(event);
  };

  return (
    <div
      className="focus-ring-overlay relative w-full rounded-lg"
      data-invalid={invalid || undefined}
    >
      <textarea
        {...props}
        aria-describedby={showCount ? countId : undefined}
        aria-errormessage={ariaErrorMessageId}
        aria-invalid={invalid || undefined}
        className={cn(
          'textarea-scrollbar block min-h-81.75 resize-y py-5',
          showCount ? 'pb-12' : undefined,
          fieldBaseClassName,
          fieldStateClassName,
          className
        )}
        data-invalid={invalid || undefined}
        defaultValue={defaultValue}
        disabled={disabled}
        id={fieldId}
        maxLength={maxLength}
        onChange={handleChange}
        ref={ref}
        required={required}
        value={value}
      />

      {showCount ? (
        <p
          className={cn(
            'pointer-events-none absolute right-3 bottom-px left-px z-(--z-index-form-floating) m-0 flex h-8 items-center justify-end rounded-bl-lg bg-gray-600 px-4 body-14 font-normal text-gray-200',
            disabled ? 'bg-gray-700 text-gray-500' : undefined
          )}
          data-max-length-reached={hasReachedMaxLength || undefined}
          data-recommended-length-exceeded={hasExceededRecommendedLength || undefined}
          id={countId}
        >
          <span
            className={cn(
              'text-primary-500',
              isNearCountLimit ? 'text-yellow-500' : undefined,
              hasExceededCountLimit ? 'text-error-500' : undefined,
              disabled ? 'text-gray-500' : undefined
            )}
          >
            {currentLength}
          </span>
          {countLimit !== undefined ? `/${countLimit}자` : '자'}
        </p>
      ) : null}
    </div>
  );
}
