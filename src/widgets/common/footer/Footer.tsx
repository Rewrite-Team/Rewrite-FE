import type { ComponentPropsWithoutRef } from 'react';

import { GithubIcon } from '@/shared/assets/icons/common';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';
import { LinkButton } from '@/shared/ui/button';
import { TextLogo } from '@/shared/ui/logo';

interface FooterProps extends ComponentPropsWithoutRef<'footer'> {
  githubHref?: string;
  logoHref?: string;
}

const GITHUB_REPOSITORY_URL = 'https://github.com/Rewrite-Team';

/**
 * ## Footer
 *
 * @description
 * 서비스 전반에서 사용하는 공통 Footer 위젯입니다.
 * 프로젝트 로고, 저작권 정보, GitHub 저장소 링크를 제공합니다.
 *
 * @param githubHref - GitHub 저장소 링크입니다.
 * @param logoHref - 로고 클릭 시 이동할 경로입니다.
 */
export function Footer({
  className,
  githubHref = GITHUB_REPOSITORY_URL,
  logoHref = ROUTES.LANDING,
  ...props
}: FooterProps) {
  return (
    <footer className={cn('w-full bg-gray-800 text-white', className)} {...props}>
      <div className="mx-auto flex min-h-14 w-full items-center justify-between px-5 py-7 xl:px-20">
        <div className="flex flex-col gap-6">
          <TextLogo aria-label="Re:write 홈으로 이동" href={logoHref} />
          <p className="body-16 font-normal text-white">© 2026 Re:write</p>
        </div>

        <nav aria-label="프로젝트 링크" className="flex items-center">
          <LinkButton
            aria-label="Re:write GitHub 저장소로 이동"
            className="text-white"
            external
            href={githubHref}
            iconOnly
            target="_blank"
            variant="ghost"
            size="icon"
          >
            <GithubIcon aria-hidden className="size-7" focusable={false} />
          </LinkButton>
        </nav>
      </div>
    </footer>
  );
}
