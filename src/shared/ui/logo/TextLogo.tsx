import type { ComponentPropsWithoutRef } from 'react';

import Link from 'next/link';

import { TextLogo as TextLogoAsset } from '@/shared/assets/logos';
import { cn } from '@/shared/styles/utils/cn';

const GUEST_LOGO_HREF = '/';
const USER_LOGO_HREF = '/writing';

type TextLogoTag = 'h1' | 'div';

interface TextLogoProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'children' | 'href'> {
  as?: TextLogoTag;
  isLoggedIn?: boolean;
}

/**
 * 서비스 전반에서 사용하는 텍스트 로고 컴포넌트입니다.
 *
 * 페이지의 heading 구조를 깨뜨리지 않도록 `as`로 시맨틱 래퍼를 선택하고,
 * 로고 클릭 시 로그인 상태에 맞는 시작 페이지로 이동합니다.
 *
 * @example
 * ```tsx
 * <TextLogo as="h1" isLoggedIn={false} />
 * <TextLogo as="div" isLoggedIn />
 * ```
 */
export default function TextLogo({
  as = 'div',
  className,
  isLoggedIn = false,
  ...props
}: TextLogoProps) {
  const Component = as;
  const href = isLoggedIn ? USER_LOGO_HREF : GUEST_LOGO_HREF;
  const ariaLabel = isLoggedIn ? '자기소개서 목록으로 이동' : '랜딩 페이지로 이동';

  return (
    <Component className="m-0 inline-flex">
      <Link
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500',
          className
        )}
        href={href}
        {...props}
      >
        <TextLogoAsset
          aria-hidden
          className="h-5.5 w-25.5"
          focusable={false}
          height={22}
          width={102}
        />
      </Link>
    </Component>
  );
}
