import type { ComponentPropsWithoutRef } from 'react';

import Link from 'next/link';

import { TextLogo as TextLogoAsset } from '@/shared/assets/logos';
import { cn } from '@/shared/styles/utils/cn';

type TextLogoTag = 'h1' | 'div';

interface TextLogoProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'children'> {
  as?: TextLogoTag;
  'aria-label': string;
}

/**
 * 서비스 전반에서 사용하는 텍스트 로고 컴포넌트입니다.
 *
 * 페이지의 heading 구조를 깨뜨리지 않도록 `as`로 시맨틱 래퍼를 선택하고,
 * 이동 경로와 접근성 라벨은 사용하는 화면의 흐름에 맞춰 상위에서 전달합니다.
 *
 * @example
 * ```tsx
 * <TextLogo as="h1" href="/" aria-label="홈으로 이동" />
 * ```
 */
export default function TextLogo({ as = 'div', className, ...props }: TextLogoProps) {
  const Component = as;

  return (
    <Component className="m-0 inline-flex">
      <Link
        className={cn(
          'inline-flex items-center transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500',
          className
        )}
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
