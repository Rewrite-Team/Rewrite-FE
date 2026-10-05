'use client';

import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Profile, type UserProfile } from '@/entities/user';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';
import { LinkButton } from '@/shared/ui/button';
import { TextLogo } from '@/shared/ui/logo';
import { Skeleton } from '@/shared/ui/skeleton';

interface HeaderProps extends ComponentPropsWithoutRef<'header'> {
  user?: UserProfile | null;
  authenticatedAction?: ReactNode;
  isUserLoading?: boolean;
  logoHref?: string;
  loginHref?: string;
  authenticatedLogoHref?: string;
  isBackgroundBlurred?: boolean;
  blurThreshold?: number;
}

/**
 * ## Header
 *
 * @description
 * 서비스 상단에서 사용하는 공통 Header 위젯입니다.
 * 게스트는 로그인 CTA를, 로그인 사용자는 프로필을 표시합니다.
 *
 * @param user - 로그인 사용자 정보. 없으면 게스트 Header로 렌더링합니다.
 * @param isUserLoading - 로그인 상태를 확인하는 동안 게스트 CTA를 숨깁니다.
 * @param logoHref - 로고 클릭 시 이동할 경로. 기본값은 로그인 여부에 따라 결정합니다.
 * @param authenticatedLogoHref - 로그인 상태일 때 로고 클릭 시 이동할 기본 경로입니다.
 * @param isBackgroundBlurred - 전달하면 스크롤 감지 대신 blur 상태를 외부에서 제어합니다.
 * @param blurThreshold - 스크롤 blur가 활성화되는 기준 scrollY 값입니다.
 */
export function Header({
  authenticatedLogoHref = ROUTES.WRITING,
  authenticatedAction,
  blurThreshold = 0,
  className,
  isBackgroundBlurred,
  isUserLoading = false,
  loginHref = ROUTES.LOGIN,
  logoHref,
  user,
  ...props
}: HeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const isLoggedIn = Boolean(user);
  const resolvedLogoHref = logoHref ?? (isLoggedIn ? authenticatedLogoHref : ROUTES.LANDING);
  const shouldBlur = isBackgroundBlurred ?? hasScrolled;

  useEffect(() => {
    if (isBackgroundBlurred !== undefined) {
      return;
    }

    const handleScroll = () => {
      setHasScrolled(window.scrollY > blurThreshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [blurThreshold, isBackgroundBlurred]);

  return (
    <header
      className={cn(
        'sticky top-0 z-(--z-index-header) w-dvw max-w-none transition-[background-color,box-shadow,backdrop-filter] duration-200',
        shouldBlur && 'bg-black/70 shadow-lg shadow-black/20 backdrop-blur-md',
        className
      )}
      data-scrolled={shouldBlur}
      {...props}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between px-5 xl:px-20">
        <TextLogo aria-label="Re:write 홈으로 이동" href={resolvedLogoHref} />

        {user ? (
          <div className="flex items-center gap-4">
            <Profile name={user.name} profileImageUrl={user.profileImageUrl} />
            {authenticatedAction}
          </div>
        ) : isUserLoading ? (
          <div
            aria-busy="true"
            aria-label="로그인 상태 확인 중"
            className="flex items-center gap-4"
            role="status"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full border border-white" />
              <Skeleton className="h-6 w-16 sm:w-20" />
            </div>
            <Skeleton className="size-9 shrink-0 rounded-full" />
          </div>
        ) : (
          <nav aria-label="게스트 메뉴" className="flex items-center">
            <LinkButton
              className="h-9 w-auto rounded-full border border-primary-300/40 bg-primary-500 px-5 text-white transition-colors duration-200 hover:border-primary-100 hover:bg-primary-400 active:bg-primary-600"
              href={loginHref}
              size="sm"
              variant="primary"
            >
              로그인
            </LinkButton>
          </nav>
        )}
      </div>
    </header>
  );
}
