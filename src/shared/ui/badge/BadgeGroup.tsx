import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/styles/utils/cn';

import Badge from './Badge';

interface BadgeGroupProps extends ComponentPropsWithoutRef<'ul'> {
  companyName: string;
  jobName: string;
  companyBadgeClassName?: string;
  jobBadgeClassName?: string;
}

/**
 * ## BadgeGroup
 *
 * @description
 * 회사명 배지와 직무 배지를 함께 표시하는 조합형 공통 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 자기소개서 카드와 상세 헤더처럼 회사명과 직무가 항상 함께 노출되는 영역에서 사용합니다.
 * 개별 배지 스타일은 `Badge` 컴포넌트의 `company`, `job` variant를 그대로 사용합니다.
 *
 * ### 접근성
 *
 * 두 배지는 서로 관련된 분류 정보이므로 `ul`, `li` 목록 구조로 렌더링합니다.
 * 목록의 목적은 기본 `aria-label`로 제공하며, 필요하면 상위에서 덮어쓸 수 있습니다.
 *
 * @param companyName - 회사명 배지에 표시할 텍스트
 * @param jobName - 직무 배지에 표시할 텍스트
 * @param className - 배지 그룹 레이아웃을 확장할 때 사용하는 클래스 이름
 * @param companyBadgeClassName - 회사명 배지 스타일을 확장할 때 사용하는 클래스 이름
 * @param jobBadgeClassName - 직무 배지 스타일을 확장할 때 사용하는 클래스 이름
 *
 * @example
 * ```tsx
 * <BadgeGroup companyName="회사명" jobName="직무" />
 * ```
 */
export default function BadgeGroup({
  companyName,
  jobName,
  className,
  companyBadgeClassName,
  jobBadgeClassName,
  'aria-label': ariaLabel = '지원 회사와 직무',
  ...props
}: BadgeGroupProps) {
  return (
    <ul
      className={cn('m-0 flex list-none flex-wrap gap-1 p-0', className)}
      aria-label={ariaLabel}
      {...props}
    >
      <li>
        <Badge variant="company" className={companyBadgeClassName}>
          {companyName}
        </Badge>
      </li>
      <li>
        <Badge variant="job" className={jobBadgeClassName}>
          {jobName}
        </Badge>
      </li>
    </ul>
  );
}
