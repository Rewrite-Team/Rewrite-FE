import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/styles/utils/cn';

type SpinnerProps = HTMLAttributes<HTMLSpanElement>;

/**
 * ## Spinner
 *
 * @description
 * 비동기 작업이 진행 중임을 시각적으로 표시하는 공통 로딩 컴포넌트입니다.
 * 단독 상태 안내가 필요한 경우에는 스크린 리더용 문구를 별도로 제공합니다.
 *
 * ### 접근성
 *
 * Spinner 자체는 장식 요소이므로 스크린 리더에서 제외됩니다.
 *
 * @param className - 크기와 색상 등 기본 스타일을 확장할 클래스
 *
 * @example
 * ```tsx
 * <span role="status">
 *   <Spinner />
 *   <span className="sr-only">불러오는 중</span>
 * </span>
 * ```
 */
export default function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}
