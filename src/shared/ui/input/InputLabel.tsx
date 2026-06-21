import { cn } from '@/shared/styles/utils/cn';

import { useInputContext } from './InputContext';

import type { InputLabelProps } from './Input.types';

/**
 * ## Input.Label
 *
 * @description
 * Field의 목적을 표시하고 Root가 제공하는 id를 통해 Field와 자동으로 연결되는 Label입니다.
 * Root가 `required`이면 시각적인 필수 표시를 추가합니다.
 *
 * ### 접근성
 *
 * 필수 표시 `*`는 장식 요소로 숨기고 실제 필수 상태는 Field의 네이티브 `required`와
 * `aria-required`로 전달합니다.
 *
 * @param children - Field의 목적을 설명하는 Label 문구
 * @param className - Label의 기본 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Input.Label>자기소개서 제목</Input.Label>
 * ```
 */
export function InputLabel({ children, className, ...props }: InputLabelProps) {
  const { fieldId, required } = useInputContext();

  return (
    <label
      {...props}
      className={cn('mb-6 w-fit body-18 font-semibold text-white', className)}
      htmlFor={fieldId}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-primary-500">
          {' '}
          *
        </span>
      ) : null}
    </label>
  );
}
