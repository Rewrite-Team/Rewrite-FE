'use client';

import { cn } from '@/shared/styles/utils/cn';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceSectionProps } from './Surface.types';

/**
 * ## Surface.Header
 *
 * @description
 * Surface 상단 영역입니다. 제목, 설명, 닫기 버튼 같은 요소를 배치합니다.
 *
 * ### 접근성
 *
 * 제목 텍스트는 `h2`처럼 적절한 heading 요소로 전달하는 것을 권장합니다. 이 heading을
 * 접근성 이름으로 쓰려면 직접 id를 지정하고 `Surface.Content`의 `aria-labelledby`와
 * 연결합니다.
 */
export function SurfaceHeader({ children, className, ref, ...props }: SurfaceSectionProps) {
  useSurfaceContext();

  return (
    <div
      {...props}
      className={cn('flex shrink-0 items-start justify-between gap-4 px-6 pt-6', className)}
      ref={ref}
    >
      {children}
    </div>
  );
}

/**
 * ## Surface.Body
 *
 * @description
 * Surface 본문 영역입니다. 입력 폼, 안내 문구, 리스트 등 실제 콘텐츠를 배치합니다.
 *
 * ### 접근성
 *
 * 보조 설명이 필요하면 직접 id를 지정하고 `Surface.Content`의 `aria-describedby`와
 * 연결합니다.
 */
export function SurfaceBody({ children, className, ref, ...props }: SurfaceSectionProps) {
  useSurfaceContext();

  return (
    <div
      {...props}
      className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5 body-16 text-gray-50', className)}
      ref={ref}
    >
      {children}
    </div>
  );
}

/**
 * ## Surface.Footer
 *
 * @description
 * Surface 하단 액션 영역입니다. 확인, 취소, 저장 같은 주요 액션을 배치합니다.
 *
 * ### 주요 내용
 *
 * 오른쪽 정렬과 일정한 버튼 간격을 기본으로 제공합니다. 액션이 필요 없는 Surface에서는
 * 생략할 수 있습니다.
 */
export function SurfaceFooter({ children, className, ref, ...props }: SurfaceSectionProps) {
  useSurfaceContext();

  return (
    <div
      {...props}
      className={cn('flex shrink-0 items-center justify-end gap-3 px-6 pb-6', className)}
      ref={ref}
    >
      {children}
    </div>
  );
}
