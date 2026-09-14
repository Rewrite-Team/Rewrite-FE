import type { ComponentProps, ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { BadgeGroup } from '@/shared/ui/badge';
import { Title } from '@/shared/ui/title';

interface BadgeTitleProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  companyName: string;
  jobName: string;
  title: string;
  titleAs?: ComponentProps<typeof Title>['as'];
  badgeGroupClassName?: string;
  companyBadgeClassName?: string;
  jobBadgeClassName?: string;
  titleClassName?: string;
}

/**
 * ## BadgeTitle
 *
 * @description
 * 회사명, 직무 배지와 자기소개서 제목을 함께 표시하는 조합형 공통 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 자기소개서 목록 카드나 상세 페이지 헤더처럼 회사명, 직무, 제목이 하나의 정보 묶음으로
 * 노출되는 영역에서 사용합니다. 배지는 `BadgeGroup`, 제목은 `Title` 컴포넌트를 조합합니다.
 *
 * ### 접근성
 *
 * 제목은 문서 구조에 맞게 `titleAs`로 heading level을 선택합니다.
 * 회사명과 직무는 `BadgeGroup` 내부에서 목록 구조로 렌더링됩니다.
 *
 * @param companyName - 회사명 배지에 표시할 텍스트
 * @param jobName - 직무 배지에 표시할 텍스트
 * @param title - 제목 영역에 표시할 텍스트
 * @param titleAs - 렌더링할 heading 태그
 * @param className - 전체 레이아웃을 확장할 때 사용하는 클래스 이름
 * @param badgeGroupClassName - 배지 그룹 레이아웃을 확장할 때 사용하는 클래스 이름
 * @param companyBadgeClassName - 회사명 배지 스타일을 확장할 때 사용하는 클래스 이름
 * @param jobBadgeClassName - 직무 배지 스타일을 확장할 때 사용하는 클래스 이름
 * @param titleClassName - 제목 스타일을 확장할 때 사용하는 클래스 이름
 *
 * @example
 * ```tsx
 * <BadgeTitle companyName="회사명" jobName="직무" title="자기소개서 제목" />
 * ```
 */
export function BadgeTitle({
  companyName,
  jobName,
  title,
  titleAs = 'h2',
  className,
  badgeGroupClassName,
  companyBadgeClassName,
  jobBadgeClassName,
  titleClassName = 'heading-24',
  ...props
}: BadgeTitleProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)} {...props}>
      <BadgeGroup
        companyName={companyName}
        jobName={jobName}
        className={badgeGroupClassName}
        companyBadgeClassName={companyBadgeClassName}
        jobBadgeClassName={jobBadgeClassName}
      />
      <Title as={titleAs} className={titleClassName} title={title}>
        {title}
      </Title>
    </div>
  );
}
