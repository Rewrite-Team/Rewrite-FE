'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import { usePathname } from 'next/navigation';

import {
  DeleteIcon,
  InterviewIcon,
  KeywordIcon,
  MenuIcon,
  VersionIcon,
  WritingDetailIcon,
} from '@/shared/assets/icons/side-menu';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';
import { ConfirmModal } from '@/shared/ui/confirm-modal';

import styles from './Sidebar.module.css';
import { SidebarItem } from './SidebarItem';

type SidebarVariant = 'compact' | 'full';

interface SidebarProps extends ComponentPropsWithoutRef<'aside'> {
  writingId: string;
  coverLetterTitle?: string | null;
  isReviewing?: boolean;
  isVersionPanelOpen?: boolean;
  isDeletePending?: boolean;
  onDelete?: () => void | Promise<void>;
  onVersionClick?: () => void;
  pathname?: string;
  variant?: SidebarVariant;
}

const isPathActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const handlePendingVersionClick = () => {
  // TODO: 버전 관리 모달 구현 후 연결합니다.
};

/**
 * ## Sidebar
 *
 * @description
 * 자기소개서 상세, 키워드 분석, AI 면접 화면에서 공유하는 경로 기반 내비게이션입니다.
 * 상세 화면은 전체 메뉴를, 하위 기능 화면은 간결한 메뉴를 기본으로 표시합니다.
 * AI 첨삭, 키워드 분석, AI 면접을 직접 이동하는 평면 메뉴로 제공하고 현재 경로를 기준으로
 * Active 메뉴를 계산합니다. 메뉴 버튼으로 아이콘 목록을 펼치거나 접습니다.
 * 모바일에서는 메뉴 버튼만 표시하고 펼치면 아이콘과 라벨을 담은 플로팅 패널을 노출합니다.
 *
 * ### 접근성
 *
 * 전체 메뉴는 이름이 있는 `nav`로 제공되며, 아이콘 버튼에는 동작을 설명하는 접근성 이름을
 * 전달합니다. 현재 페이지 링크는 SidebarItem에서 `aria-current="page"`로 표시합니다.
 *
 * @param writingId - 메뉴 경로에 사용할 자기소개서 식별자
 * @param pathname - Storybook/테스트에서 현재 경로를 주입할 때 사용합니다.
 * @param variant - 표시 형태를 명시적으로 덮어씁니다.
 * @param isDeletePending - 삭제 요청 진행 중 확인 모달의 닫기와 중복 요청을 막습니다.
 * @param onDelete - 삭제 확인 후 실행합니다. 실패하면 모달을 유지합니다.
 * @param onVersionClick - 버전 관리 메뉴를 선택했을 때 실행할 콜백입니다.
 */
export function Sidebar({
  className,
  coverLetterTitle,
  isReviewing = false,
  isVersionPanelOpen = false,
  isDeletePending = false,
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
  const inferredVariant: SidebarVariant = pathname === routes.detail ? 'full' : 'compact';
  const variant = variantProp ?? inferredVariant;
  const shouldRestoreToggleFocusRef = useRef(false);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isDetailActive = pathname === routes.detail;
  const isKeywordActive = isPathActive(pathname, routes.keywordAnalysis);
  const isInterviewActive = isPathActive(pathname, routes.interview);
  const mobileMenuItemClassName = isExpanded
    ? cn('w-full', styles.menuItemEntering)
    : 'hidden lg:block';
  const shouldShowMobileLabel = isExpanded;

  const handleToggle = () => {
    setIsExpanded((wasExpanded) => !wasExpanded);
  };

  const handleSidebarClose = () => {
    setIsExpanded(false);
  };

  const handleDeleteClick = () => {
    setIsExpanded(false);
    setIsDeleteModalOpen(true);
  };

  const handleVersionClick = () => {
    (onVersionClick ?? handlePendingVersionClick)();

    if (window.matchMedia?.('(max-width: 63.999rem)').matches) {
      setIsExpanded(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isDeletePending) return;

    try {
      await onDelete?.();
      setIsDeleteModalOpen(false);
    } catch {
      // 삭제 실패 토스트는 mutation에서 표시하고, 확인 모달은 유지합니다.
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        shouldRestoreToggleFocusRef.current = true;
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded || !shouldRestoreToggleFocusRef.current) {
      return;
    }

    sidebarToggleRef.current?.focus();
    shouldRestoreToggleFocusRef.current = false;
  }, [isExpanded]);

  return (
    <>
      {isExpanded ? (
        <button
          aria-label="사이드바 닫기"
          className={cn(
            'fixed inset-0 z-(--z-index-sidebar-backdrop) bg-backdrop lg:hidden',
            styles.backdropEntering
          )}
          onClick={handleSidebarClose}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          'relative z-(--z-index-sidebar) w-fit rounded-full border border-white/8 bg-gray-800/95 p-2.5 text-gray-300 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none lg:p-3',
          isExpanded && [
            'rounded-2xl bg-gray-800/98 shadow-[0_20px_48px_rgba(0,0,0,0.45)]',
            styles.panelEntering,
          ],
          className
        )}
        {...props}
      >
        <nav aria-label="자기소개서 메뉴">
          <ul
            className={cn(
              'flex w-11 flex-col items-center gap-1 lg:w-10 lg:transition-[width] lg:duration-300 lg:ease-out lg:motion-reduce:transition-none',
              isExpanded && 'w-44 items-stretch lg:w-44'
            )}
          >
            <li className="my-1 hidden h-px w-full bg-gray-600 lg:block" aria-hidden />

            <li className={mobileMenuItemClassName}>
              <SidebarItem
                href={routes.detail}
                icon={WritingDetailIcon}
                isActive={isDetailActive}
                isExpanded={isExpanded}
                label="AI 첨삭"
                onSelect={handleSidebarClose}
                showMobileLabel={shouldShowMobileLabel}
              />
            </li>

            {variant === 'full' ? (
              <>
                <li className={mobileMenuItemClassName}>
                  <SidebarItem
                    ariaExpanded={isVersionPanelOpen}
                    icon={VersionIcon}
                    isActive={isVersionPanelOpen}
                    isExpanded={isExpanded}
                    label="버전 관리"
                    onClick={handleVersionClick}
                    showMobileLabel={shouldShowMobileLabel}
                  />
                </li>
                <li className={mobileMenuItemClassName}>
                  <SidebarItem
                    icon={DeleteIcon}
                    isExpanded={isExpanded}
                    label="자기소개서 삭제"
                    onClick={handleDeleteClick}
                    showMobileLabel={shouldShowMobileLabel}
                  />
                </li>
              </>
            ) : null}

            {isDetailActive ? (
              <li
                className={cn(
                  'my-1 hidden h-px w-full bg-gray-600 lg:block',
                  isExpanded && ['block', styles.menuItemEntering]
                )}
                aria-hidden
              />
            ) : null}

            <li className={mobileMenuItemClassName}>
              <SidebarItem
                href={routes.keywordAnalysis}
                icon={KeywordIcon}
                isActive={isKeywordActive}
                isExpanded={isExpanded}
                label="키워드 분석"
                onSelect={handleSidebarClose}
                showMobileLabel={shouldShowMobileLabel}
              />
            </li>

            <li className={mobileMenuItemClassName}>
              <SidebarItem
                href={routes.interview}
                icon={InterviewIcon}
                isActive={isInterviewActive}
                isExpanded={isExpanded}
                label="AI 면접"
                onSelect={handleSidebarClose}
                showMobileLabel={shouldShowMobileLabel}
              />
            </li>

            <li className="self-center lg:order-first lg:self-stretch">
              <SidebarItem
                ariaExpanded={isExpanded}
                buttonRef={sidebarToggleRef}
                icon={MenuIcon}
                isExpanded={isExpanded}
                label={isExpanded ? '메뉴 접기' : '사이드바 펼치기'}
                onClick={handleToggle}
              />
            </li>
          </ul>
        </nav>
      </aside>

      <ConfirmModal
        cancelLabel="아니오"
        confirmLabel="삭제하기"
        description={
          <>
            삭제 후에는 복구할 수 없습니다.
            {isReviewing ? (
              <>
                <br />
                진행 중인 AI 첨삭도 중단됩니다.
              </>
            ) : null}
          </>
        }
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open && isDeletePending) return;
          setIsDeleteModalOpen(open);
        }}
        open={isDeleteModalOpen}
        title={
          <>
            <span
              className="body-16 mb-2 block wrap-break-word font-medium text-white"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
              }}
            >
              {coverLetterTitle?.trim() || '제목 없는 자기소개서'}
            </span>
            이 자기소개서를 삭제할까요?
          </>
        }
        isLoading={isDeletePending}
      />
    </>
  );
}
