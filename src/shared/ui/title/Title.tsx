import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/styles/utils/cn';

interface TitleProps extends ComponentPropsWithoutRef<'h1'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * ## Title
 *
 * @description
 * 서비스 전반에서 페이지와 섹션 제목을 일관된 스타일과 시맨틱 heading 태그로 렌더링하는
 * 공통 제목 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * `as` 값에 따라 `h1`부터 `h6`까지 실제 heading 태그를 렌더링하고,
 * 공통 제목에 필요한 최소 스타일만 적용합니다.
 *
 * ### 접근성
 *
 * 페이지와 섹션 구조에 맞는 heading level을 상위에서 선택해야 합니다.
 *
 * @param as - 렌더링할 heading 태그와 기본 스타일 레벨
 * @param className - 기본 제목 스타일을 확장할 때 사용하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Title as="h1" className="text-[48px] leading-[58px]">자기소개서 목록</Title>
 * <Title as="h2" className="text-primary-500 body-20">키워드 분석</Title>
 * ```
 */
export function Title({ as = 'h1', className, children, ...props }: TitleProps) {
  const Component = as;

  return (
    <Component className={cn('m-0 wrap-break-word font-semibold text-white', className)} {...props}>
      {children}
    </Component>
  );
}
