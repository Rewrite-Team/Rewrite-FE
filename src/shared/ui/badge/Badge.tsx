import type { ComponentPropsWithoutRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';

const badgeVariants = cva(
  'inline-flex max-w-full shrink-0 items-center rounded-full border px-2 h-4.5 body-12 font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        company: 'border-yellow-500 bg-yellow-50 text-yellow-500',
        job: 'border-primary-500 bg-primary-50 text-primary-500',
      },
    },
    defaultVariants: {
      variant: 'company',
    },
  }
);

interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'children'>, VariantProps<typeof badgeVariants> {
  children: string;
}

/**
 * ## Badge
 *
 * @description
 * 회사명, 직무처럼 자기소개서의 주요 분류 정보를 짧은 태그 형태로 표시하는 공통 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * `company` variant는 회사명, `job` variant는 지원 직무를 표시할 때 사용합니다.
 * 배지는 클릭 가능한 액션이 아니라 정보를 보여주는 요소이므로 기본적으로 `span`으로 렌더링합니다.
 *
 * ### 접근성
 *
 * 여러 배지를 함께 표시할 때는 사용하는 쪽에서 `ul`, `li` 같은 목록 구조로 관계를 표현합니다.
 * 시각적으로만 의미가 전달되지 않도록 배지 내부에는 실제 텍스트를 전달합니다.
 *
 * @param variant - 회사명 또는 직무를 구분하는 스타일 타입
 * @param className - 기본 배지 스타일을 확장할 때 사용하는 클래스 이름
 * @param children - 배지에 표시할 짧은 텍스트
 *
 * @example
 * ```tsx
 * <Badge variant="company">회사명</Badge>
 * <Badge variant="job">직무</Badge>
 * ```
 */
export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
