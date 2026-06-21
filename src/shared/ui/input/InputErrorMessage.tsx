import { cn } from '@/shared/styles/utils/cn';

import { useInputContext } from './InputContext';

import type { InputErrorMessageProps } from './Input.types';

/**
 * ## Input.ErrorMessage
 *
 * @description
 * 유효성 검증 실패 원인과 해결 방법을 표시하는 선택적 오류 문구입니다.
 * Root의 `invalid`가 true이고 `children`이 있을 때만 렌더링됩니다.
 *
 * ### 접근성
 *
 * `role="alert"`로 오류를 알리고 Field의 `aria-describedby` 및 `aria-errormessage`와
 * 자동으로 연결합니다. 사용자가 수정할 수 있는 구체적인 메시지를 전달합니다.
 *
 * @param children - 유효성 검증 오류 메시지
 * @param className - ErrorMessage의 기본 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Input.ErrorMessage>올바른 URL을 입력해 주세요.</Input.ErrorMessage>
 * ```
 */
export function InputErrorMessage({ children, className, ...props }: InputErrorMessageProps) {
  const { errorMessageId, invalid } = useInputContext();

  if (!invalid || !children) {
    return null;
  }

  return (
    <p
      {...props}
      className={cn('mt-2 mb-0 body-14 text-error-500', className)}
      id={errorMessageId}
      role="alert"
    >
      {children}
    </p>
  );
}
