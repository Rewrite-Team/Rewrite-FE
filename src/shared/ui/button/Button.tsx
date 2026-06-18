import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import ButtonContent from './ButtonContent';
import { buttonVariants, type ButtonVariantProps } from './buttonVariants';

import type { ButtonAccessibilityProps, ButtonStateProps } from './Button.types';

type ButtonProps = ButtonVariantProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'disabled'> &
  ButtonStateProps &
  ButtonAccessibilityProps;

/**
 * ## Button
 *
 * @description
 * 저장, 삭제, 제출처럼 현재 화면에서 동작을 실행할 때 사용하는 공통 버튼 컴포넌트입니다.
 * 페이지 이동에는 `Button` 대신 `LinkButton`을 사용합니다.
 *
 * ### 주요 내용
 *
 * `variant`와 `size`로 형태를 제어하며, `isLoading` 상태에서는 중복 실행을 막기 위해 버튼을
 * 비활성화하고 로딩 표시를 제공합니다. 아이콘만 표시할 때는 `iconOnly`를 사용합니다.
 *
 * ### 접근성
 *
 * `iconOnly` 버튼에는 동작을 설명하는 `aria-label`을 반드시 전달해야 합니다.
 *
 * @param isLoading - 비동기 작업 진행 여부. 활성화하면 버튼이 비활성화됩니다.
 * @param iconOnly - 텍스트 없이 아이콘만 표시하는 버튼인지 여부
 *
 * @example
 * ```tsx
 * <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
 *   저장하기
 * </Button>
 * ```
 */
export default function Button({
  children,
  className,
  disabled = false,
  iconOnly = false,
  isLoading = false,
  size,
  type = 'button',
  variant,
  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const resolvedSize = iconOnly ? 'icon' : size;
  const buttonClassName = cn(buttonVariants({ variant, size: resolvedSize }), className);

  return (
    <button
      {...buttonProps}
      aria-busy={isLoading || undefined}
      className={buttonClassName}
      data-disabled={isDisabled}
      data-loading={isLoading || undefined}
      disabled={isDisabled}
      type={type}
    >
      <ButtonContent isLoading={isLoading}>{children}</ButtonContent>
    </button>
  );
}
