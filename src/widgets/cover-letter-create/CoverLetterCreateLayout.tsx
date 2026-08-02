import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { PageHeader } from '@/shared/ui/page-header';

interface CoverLetterCreateLayoutProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  description: string;
  sidebar: ReactNode;
  title: string;
}

/**
 * ## CoverLetterCreateLayout
 *
 * @description
 * 자기소개서 등록 STEP1~4에서 공통으로 사용하는 2열 페이지 레이아웃입니다.
 * 단계별 제목과 설명, 주 콘텐츠, 진행·액션 영역을 동일한 구조로 배치합니다.
 *
 * ### 반응형
 *
 * 작은 화면에서는 헤더, 사이드바, 주 콘텐츠 순서로 쌓이고, `lg` 이상에서는 주 콘텐츠와
 * 사이드바가 Figma의 728:352 비율과 30px 간격을 기준으로 두 열에 배치됩니다.
 *
 * @param title - 단계별 페이지 제목
 * @param description - 페이지 제목 아래에 표시하는 단계별 설명
 * @param children - 왼쪽 열에 배치하는 단계별 주 콘텐츠
 * @param sidebar - 오른쪽 열에 배치하는 진행 상태와 단계별 액션
 * @param className - 최상위 레이아웃의 기본 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <CoverLetterCreateLayout
 *   title="내 자기소개서 등록"
 *   description="자기소개서 제목과 지원 회사, 직무 정보를 입력할 수 있습니다."
 *   sidebar={<CoverLetterCreateSidebar />}
 * >
 *   <CoverLetterBasicInfoForm />
 * </CoverLetterCreateLayout>
 * ```
 */
export function CoverLetterCreateLayout({
  children,
  className,
  description,
  sidebar,
  title,
  ...props
}: CoverLetterCreateLayoutProps) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 items-start lg:grid-cols-[minmax(0,728fr)_minmax(16rem,352fr)] lg:gap-x-7.5',
        className
      )}
      {...props}
    >
      <PageHeader className="lg:col-start-1" description={description} title={title} />

      <aside
        aria-label="자기소개서 등록 진행 및 작업"
        className="mt-6 flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:mt-9"
      >
        {sidebar}
      </aside>

      <div className="mt-9 flex min-w-0 flex-col gap-12 lg:col-start-1 lg:row-start-2">
        {children}
      </div>
    </div>
  );
}
