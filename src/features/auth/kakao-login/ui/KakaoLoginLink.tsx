import type { ComponentPropsWithoutRef } from 'react';

import { KakaoSymbolIcon } from '@/shared/assets/icons/common';
import { cn } from '@/shared/styles/utils/cn';

interface KakaoLoginLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'> {
  href?: string;
}

const DEFAULT_KAKAO_LOGIN_URL = '/api/auth/kakao';

/** 카카오 OAuth 인증을 시작하는 로그인 링크입니다. */
export function KakaoLoginLink({
  className,
  href = DEFAULT_KAKAO_LOGIN_URL,
  ...props
}: KakaoLoginLinkProps) {
  return (
    <a
      className={cn(
        'focus-ring flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-kakao px-5 body-16 font-semibold text-black transition-colors duration-200 hover:bg-kakao-hover active:bg-kakao-active',
        className
      )}
      href={href}
      {...props}
    >
      <KakaoSymbolIcon aria-hidden focusable="false" className="size-7" />
      카카오 로그인
    </a>
  );
}
