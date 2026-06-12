import type { ComponentPropsWithoutRef } from 'react';

import { SymbolLogo as SymbolLogoAsset } from '@/shared/assets/logos';
import { cn } from '@/shared/styles/utils/cn';

interface SymbolLogoProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children' | 'className'> {
  className?: string;
}

/**
 * ## SymbolLogo
 *
 * @description
 * 서비스 전반에서 장식 또는 브랜드 표시 용도로 사용하는 심볼 로고 컴포넌트입니다.
 *
 * ### 주요 내용
 *
 * 심볼 로고 SVG를 일관된 기본 크기와 접근성 속성으로 렌더링합니다.
 * 화면 맥락에 맞는 크기 조정은 `className`으로 확장합니다.
 *
 * ### 주의할 점
 *
 * 클릭 이동이 필요한 텍스트 로고와 책임을 분리하기 위해 링크 동작을 포함하지 않습니다.
 *
 * @param className - 기본 크기 또는 스타일을 확장할 때 사용하는 클래스 이름
 *
 * @example
 * ```tsx
 * <SymbolLogo />
 * <SymbolLogo className="h-10 w-13" />
 * ```
 */
export default function SymbolLogo({ className, ...props }: SymbolLogoProps) {
  return (
    <SymbolLogoAsset
      aria-hidden
      className={cn('h-7 w-9', className)}
      focusable={false}
      height={28}
      width={36}
      {...props}
    />
  );
}
