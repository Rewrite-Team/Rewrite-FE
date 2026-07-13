'use client';

import { useState } from 'react';

import { usePathname } from 'next/navigation';

import { DeleteIcon, InterviewIcon, MenuIcon, VersionIcon } from '@/shared/assets/icons/side-menu';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';

import { SidebarDropdown } from './SidebarDropdown';
import { SidebarItem } from './SidebarItem';

import type { SidebarProps, SidebarVariant } from './Sidebar.types';

const isPathActive = (pathname: string, href: string, includeChildren = true) =>
  pathname === href || (includeChildren && pathname.startsWith(`${href}/`));

/**
 * ## Sidebar
 *
 * @description
 * 자기소개서 상세, 키워드 분석, AI 면접 화면에서 공유하는 경로 기반 내비게이션입니다.
 * 상세 화면은 전체 메뉴를, 하위 기능 화면은 간결한 contextual 메뉴를 기본으로 표시합니다.
 * 현재 경로를 기준으로 Active 메뉴를 계산하고, 메뉴 버튼으로 라벨을 펼치거나 접을 수 있습니다.
 *
 * ### 접근성
 *
 * 전체 메뉴는 이름이 있는 `nav`로 제공되며, 아이콘 버튼에는 동작을 설명하는 접근성 이름을
 * 전달합니다. 현재 페이지 링크는 SidebarItem에서 `aria-current="page"`로 표시합니다.
 *
 * @param writingId - 메뉴 경로에 사용할 자기소개서 식별자
 * @param pathname - Storybook/테스트에서 현재 경로를 주입할 때 사용합니다.
 * @param variant - 표시 형태를 명시적으로 덮어씁니다.
 * @param onDelete - 삭제 메뉴 선택 시 실행할 콜백입니다.
 * @param onVersionClick - 버전 관리 메뉴 선택 시 실행할 콜백입니다.
 */
export function Sidebar({
  className,
  onDelete,
  onVersionClick,
  pathname: pathnameProp,
  variant: variantProp,
  writingId,
  ...props
}: SidebarProps) {
  const currentPathname = usePathname();
  const pathname = pathnameProp ?? currentPathname;
  const routes = {
    detail: ROUTES.WRITING_DETAIL(writingId),
    interview: ROUTES.INTERVIEW(writingId),
    keywordAnalysis: ROUTES.KEYWORD_ANALYSIS(writingId),
  };
  const inferredVariant: SidebarVariant = pathname === routes.detail ? 'detail' : 'contextual';
  const variant = variantProp ?? inferredVariant;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalysisMenuOpen, setIsAnalysisMenuOpen] = useState(false);
  const isDetailActive = pathname === routes.detail;
  const isKeywordActive = isPathActive(pathname, routes.keywordAnalysis);
  const isInterviewActive = isPathActive(pathname, routes.interview);

  const handleToggle = () => {
    setIsExpanded((wasExpanded) => !wasExpanded);
    setIsAnalysisMenuOpen(false);
  };

  const handleAnalysisMenuToggle = () => {
    setIsAnalysisMenuOpen((wasOpen) => !wasOpen);
  };

  const handleAnalysisMenuClose = () => {
    setIsAnalysisMenuOpen(false);
  };

  return (
    <aside
      className={cn(
        'w-fit rounded-full bg-gray-800 p-3 text-gray-300 shadow-lg shadow-black/20',
        isExpanded && 'rounded-3xl',
        className
      )}
      {...props}
    >
      <nav aria-label="자기소개서 메뉴">
        <ul className={cn('flex flex-col items-center gap-1', isExpanded && 'w-44 items-stretch')}>
          <li>
            <SidebarItem
              ariaExpanded={isExpanded}
              icon={MenuIcon}
              isExpanded={isExpanded}
              label={isExpanded ? '메뉴 접기' : '사이드바 펼치기'}
              onClick={handleToggle}
            />
          </li>

          <li className="my-1 h-px w-full bg-gray-600" aria-hidden />

          <SidebarDropdown
            detailHref={routes.detail}
            isDetailActive={isDetailActive}
            isExpanded={isExpanded}
            isKeywordActive={isKeywordActive}
            isOpen={isAnalysisMenuOpen}
            keywordAnalysisHref={routes.keywordAnalysis}
            onClose={handleAnalysisMenuClose}
            onToggle={handleAnalysisMenuToggle}
          />

          {variant === 'detail' ? (
            <>
              <li>
                <SidebarItem
                  icon={VersionIcon}
                  isExpanded={isExpanded}
                  label="버전 관리"
                  onClick={onVersionClick}
                />
              </li>
              <li>
                <SidebarItem
                  icon={DeleteIcon}
                  isExpanded={isExpanded}
                  label="자기소개서 삭제"
                  onClick={onDelete}
                />
              </li>
              <li className="my-1 h-px w-full bg-gray-600" aria-hidden />
            </>
          ) : null}

          <li>
            <SidebarItem
              href={routes.interview}
              icon={InterviewIcon}
              isActive={isInterviewActive}
              isExpanded={isExpanded}
              label="AI 면접"
            />
          </li>
        </ul>
      </nav>
    </aside>
  );
}
