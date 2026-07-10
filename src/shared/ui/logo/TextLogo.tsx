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
 * ## TextLogo
 *
 * @description
 * 서비스 전반에서 사용하는 텍스트 로고 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 페이지의 heading 구조를 깨뜨리지 않도록 `as`로 시맨틱 래퍼를 선택하고,
 * 내부에는 Next.js `Link`를 사용해 텍스트 로고를 클릭 가능한 링크로 렌더링합니다.
 *
 * ### 주의할 점
 *
 * `shared/ui`가 앱 흐름에 결합되지 않도록 이동 경로와 접근성 라벨은 상위에서 전달합니다.
 * 로그인 상태에 따른 목적지 선택은 app, widget, feature 같은 상위 레이어에서 처리합니다.
 *
 * @param as - 페이지 heading 구조에 맞춰 선택하는 시맨틱 래퍼 태그
 * @param href - 텍스트 로고 클릭 시 이동할 경로
 * @param aria-label - 로고 링크의 접근성 이름
 *
 * @example
 * ```tsx
 * <TextLogo as="h1" href="/" aria-label="홈으로 이동" />
 * ```
 */
export function TextLogo({ as = 'div', className, ...props }: TextLogoProps) {
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
          className="h-[19px] w-[103px]"
          focusable={false}
          height={19}
          width={103}
        />
      </Link>
    </Component>
  );
}
