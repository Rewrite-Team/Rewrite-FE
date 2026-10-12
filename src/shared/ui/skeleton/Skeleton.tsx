import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/styles/utils/cn';

type SkeletonProps = Omit<ComponentPropsWithoutRef<'div'>, 'aria-hidden'>;

/**
 * ## Skeleton
 *
 * @description
 * 비동기 콘텐츠가 로드되기 전에 실제 콘텐츠의 크기와 배치를 나타내는 공통 placeholder입니다.
 * 부모 요소에 상태 안내를 두고 Skeleton은 장식용으로 사용합니다.
 *
 * ### 접근성
 *
 * 스크린 리더에서 제외되며, 애니메이션은 사용자의 모션 감소 설정을 따릅니다.
 *
 * @param className - 콘텐츠 모양에 맞게 크기와 색상을 지정하는 클래스
 *
 * @example
 * ```tsx
 * <div role="status" aria-busy="true" aria-label="목록 불러오는 중">
 *   <Skeleton className="h-6 w-40" />
 * </div>
 * ```
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn('rounded bg-gray-800 motion-safe:animate-pulse', className)}
      data-slot="skeleton"
    />
  );
}
