import type { ComponentPropsWithoutRef } from 'react';

import Image from 'next/image';

import { cn } from '@/shared/styles/utils/cn';

import type { UserProfile } from '../model/types';

interface ProfileProps extends ComponentPropsWithoutRef<'div'>, UserProfile {
  imageAlt?: string;
}

/**
 * ## Profile
 *
 * @description
 * 로그인 사용자 프로필을 이름과 원형 프로필 이미지로 표시하는 도메인 UI입니다.
 *
 * @param name - 사용자 이름
 * @param profileImageUrl - 백엔드에서 전달받은 프로필 이미지 URL
 * @param imageAlt - 이미지 대체 텍스트. 전달하지 않으면 사용자 이름 기반으로 생성합니다.
 */
export function Profile({
  name,
  profileImageUrl,
  imageAlt = `${name} 프로필 이미지`,
  className,
  ...props
}: ProfileProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <Image
        alt={imageAlt}
        className="size-8 shrink-0 rounded-full border border-white object-cover"
        fetchPriority="high"
        height={32}
        loading="eager"
        src={profileImageUrl}
        width={32}
      />
      <span className="body-16 truncate font-medium text-white">{name}</span>
    </div>
  );
}
