'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { cn } from '@/shared/styles/utils/cn';

import type { SurfaceCloseProps } from './Surface.types';

/**
 * ## Surface.Close
 *
 * @description
 * Surface 닫기 요청을 발생시키는 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * Surface의 닫기 정책과 무관하게 항상 닫기를 요청합니다.
 *
 * ### 접근성
 *
 * `aria-label`은 필수이며, `asChild` 사용 시 자식 요소에 전달됩니다.
 * `asChild`의 자식이 button을 렌더링하지 않으면 `nativeButton={false}`를 전달합니다.
 *
 * @example
 * ```tsx
 * <Surface.Close aria-label="모달 닫기" asChild>
 *   <Button>닫기</Button>
 * </Surface.Close>
 *
 * <Surface.Close aria-label="모달 닫기" asChild>
 *   <Button aria-label="모달 닫기" iconOnly>
 *     <CloseIcon aria-hidden="true" />
 *   </Button>
 * </Surface.Close>
 * ```
 */
export function SurfaceClose(props: SurfaceCloseProps) {
  const nativeButton = props.asChild ? props.nativeButton : true;
  const { asChild, children, className, ...closeProps } = props;

  return (
    <BaseDialog.Close
      {...closeProps}
      className={cn('focus-ring', className)}
      nativeButton={nativeButton}
      render={asChild ? children : undefined}
    >
      {asChild ? undefined : children}
    </BaseDialog.Close>
  );
}
