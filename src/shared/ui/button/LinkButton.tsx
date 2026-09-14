'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

import Link, { type LinkProps } from 'next/link';

import { cn } from '@/shared/styles/utils/cn';

import { ButtonContent } from './ButtonContent';
import { buttonVariants, type ButtonVariantProps } from './buttonVariants';

import type { ButtonAccessibilityProps, ButtonStateProps } from './Button.types';

interface InternalLinkProps extends Pick<LinkProps, 'prefetch' | 'replace' | 'onNavigate'> {
  external?: false;
  href: string;
}

interface ExternalLinkProps {
  external: true;
  href: string;
  onNavigate?: never;
  prefetch?: never;
  replace?: never;
}

type LinkButtonProps = ButtonVariantProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-label' | 'children' | 'href'> &
  ButtonStateProps &
  ButtonAccessibilityProps &
  (InternalLinkProps | ExternalLinkProps);

const mergeSecurityRel = (rel?: string) => {
  const relTokens = rel?.split(/\s+/).filter(Boolean) ?? [];

  return [...new Set([...relTokens, 'noopener', 'noreferrer'])].join(' ');
};

/**
 * ## LinkButton
 *
 * @description
 * 페이지 이동이 필요하지만 버튼 형태로 표현해야 할 때 사용하는 공통 링크 컴포넌트입니다.
 * 내부 경로는 Next.js `Link`, HTTP(S) 외부 URL은 `a` 요소로 렌더링합니다.
 *
 * ### 주요 내용
 *
 * 외부 URL은 `external`을 반드시 전달하여 네이티브 `a` 요소로 렌더링합니다.
 *
 * ### 주의할 점
 *
 * 현재 화면에서 동작을 실행하는 용도에는 `LinkButton` 대신 `Button`을 사용합니다.
 * `disabled` 또는 `isLoading` 상태에서는 링크 이동과 키보드 포커스를 차단합니다.
 *
 * @param href - 이동할 내부 경로 또는 HTTP(S) 외부 URL
 * @param external - 외부 링크일 때 반드시 `true`로 지정하는 값
 * @param isLoading - 비동기 작업 진행 여부. 활성화하면 링크 이동이 차단됩니다.
 *
 * @example
 * ```tsx
 * <LinkButton href="/writing" variant="outline">
 *   자기소개서 목록
 * </LinkButton>
 *
 * <LinkButton external href="https://github.com/Rewrite-Team/Rewrite-FE" target="_blank">
 *   GitHub로 이동
 * </LinkButton>
 * ```
 */
export function LinkButton({
  children,
  className,
  disabled = false,
  external,
  href,
  iconOnly = false,
  isLoading = false,
  onClick,
  onNavigate,
  prefetch,
  rel,
  replace,
  size,
  target,
  variant,
  ...anchorProps
}: LinkButtonProps) {
  const isDisabled = disabled || isLoading;
  const resolvedSize = iconOnly ? 'icon' : size;
  const classNames = cn(buttonVariants({ variant, size: resolvedSize }), className);
  const safeRel = target === '_blank' ? mergeSecurityRel(rel) : rel;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };
  const commonProps = {
    ...anchorProps,
    'aria-busy': isLoading || undefined,
    'aria-disabled': isDisabled || undefined,
    className: classNames,
    'data-disabled': isDisabled,
    'data-loading': isLoading || undefined,
    onClick: handleClick,
    rel: safeRel,
    tabIndex: isDisabled ? -1 : anchorProps.tabIndex,
    target,
  };
  const content = <ButtonContent isLoading={isLoading}>{children}</ButtonContent>;

  if (external) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onNavigate={onNavigate}
      prefetch={prefetch}
      replace={replace}
      {...commonProps}
    >
      {content}
    </Link>
  );
}
