import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { Title } from '@/shared/ui/title';

interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<'header'>, 'title'> {
  title: ReactNode;
  description: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

/**
 * ## PageHeader
 *
 * @description
 * 페이지의 대표 제목과 설명을 일관된 구조로 제공하는 공통 헤더 컴포넌트입니다.
 *
 * ### 접근성
 *
 * 페이지의 주요 제목은 `h1`으로 렌더링하고, 설명은 제목 바로 뒤의 문단으로 제공합니다.
 * 한 페이지에서 대표 `h1`이 중복되지 않도록 페이지 조립 단계에서 사용 위치를 조정해야 합니다.
 *
 * @param title - 페이지의 대표 제목
 * @param description - 페이지 목적을 설명하는 보조 문구
 * @param className - 헤더 레이아웃을 확장할 때 사용하는 클래스 이름
 * @param titleClassName - 제목 스타일을 확장할 때 사용하는 클래스 이름
 * @param descriptionClassName - 설명 스타일을 확장할 때 사용하는 클래스 이름
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="자기소개서 목록"
 *   description="작성한 자기소개서를 확인하고 새로운 자기소개서를 등록할 수 있습니다."
 * />
 * ```
 */
export default function PageHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-2', className)} {...props}>
      <Title className={cn('heading-24', titleClassName)}>{title}</Title>
      <p className={cn('m-0 wrap-break-word body-16 font-normal text-white', descriptionClassName)}>
        {description}
      </p>
    </header>
  );
}
