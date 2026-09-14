'use client';

import { useSurfaceContext } from './SurfaceContext';

import type { SurfaceBodyProps, SurfaceFooterProps, SurfaceHeaderProps } from './Surface.types';

/**
 * ## Surface.Header
 *
 * @description
 * Surface 상단 영역입니다. 제목, 설명, 닫기 버튼 같은 요소를 배치합니다.
 * 기본 스타일을 제공하지 않으며 필요한 배치는 `className`으로 지정합니다.
 *
 * ### 접근성
 *
 * 제목 텍스트는 `h2`처럼 적절한 heading 요소로 전달하는 것을 권장합니다. 이 heading을
 * 접근성 이름으로 쓰려면 직접 id를 지정하고 `Surface.Content`의 `aria-labelledby`와
 * 연결합니다.
 */
export function SurfaceHeader({ children, className, ref, ...props }: SurfaceHeaderProps) {
  useSurfaceContext();

  return (
    <header {...props} className={className} ref={ref}>
      {children}
    </header>
  );
}

/**
 * ## Surface.Body
 *
 * @description
 * Surface 본문 영역입니다. 입력 폼, 안내 문구, 리스트 등 실제 콘텐츠를 배치합니다.
 * 기본 스타일을 제공하지 않으며 필요한 배치는 `className`으로 지정합니다.
 *
 * ### 접근성
 *
 * 보조 설명이 필요하면 직접 id를 지정하고 `Surface.Content`의 `aria-describedby`와
 * 연결합니다.
 */
export function SurfaceBody({ children, className, ref, ...props }: SurfaceBodyProps) {
  useSurfaceContext();

  return (
    <div {...props} className={className} ref={ref}>
      {children}
    </div>
  );
}

/**
 * ## Surface.Footer
 *
 * @description
 * Surface 하단 액션 영역입니다. 확인, 취소, 저장 같은 주요 액션을 배치합니다.
 * 기본 스타일을 제공하지 않으며 필요한 배치는 `className`으로 지정합니다.
 *
 * ### 주요 내용
 *
 * 액션이 필요 없는 Surface에서는 생략할 수 있습니다.
 */
export function SurfaceFooter({ children, className, ref, ...props }: SurfaceFooterProps) {
  useSurfaceContext();

  return (
    <footer {...props} className={className} ref={ref}>
      {children}
    </footer>
  );
}
