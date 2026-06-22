import { cn } from '@/shared/styles/utils/cn';

import { useFormControlContext } from './FormControlContext';

import type { FormControlErrorMessageProps } from './FormControl.types';

/**
 * ## FormControlErrorMessage
 *
 * @description
 * Input과 TextArea가 공유하는 유효성 오류 문구 기반 컴포넌트입니다. Root의 `invalid`가
 * true이고 오류 문구가 있을 때만 렌더링하여 정상 상태에서 불필요한 빈 영역을 만들지 않습니다.
 *
 * ### 주의할 점
 *
 * 이 컴포넌트는 FormControl의 내부 기반이므로 직접 사용하기보다 `Input.ErrorMessage` 또는
 * `TextArea.ErrorMessage`를 사용합니다. 오류 여부는 사용하는 폼에서 Root의 `invalid`로 전달합니다.
 *
 * ### 접근성
 *
 * Root가 생성한 `errorMessageId`를 사용하며 `role="alert"`로 오류를 알립니다. 실제 Field는
 * 동일한 id를 `aria-describedby`와 `aria-errormessage`에 사용해 오류 문구와 연결합니다.
 *
 * @param children - 유효성 검증 실패 원인과 해결 방법을 설명하는 문구
 * @param className - 공통 오류 문구 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <TextArea invalid>
 *   <TextArea.Label>자기소개서 내용</TextArea.Label>
 *   <TextArea.Field />
 *   <TextArea.ErrorMessage>내용을 입력해 주세요.</TextArea.ErrorMessage>
 * </TextArea>
 * ```
 */
export function FormControlErrorMessage({
  children,
  className,
  ...props
}: FormControlErrorMessageProps) {
  const { errorMessageId, invalid } = useFormControlContext();

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
