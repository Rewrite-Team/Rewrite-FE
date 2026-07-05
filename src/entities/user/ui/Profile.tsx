import type { ImageProps } from 'next/image';

import { DefaultProfileImage } from '@/shared/assets/images';

import { ProfileImage } from './ProfileImage';

import type { UserProfile } from '../model/types';

interface ProfileProps extends UserProfile {
  fallbackImageSrc?: ImageProps['src'];
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
 * @param fallbackImageSrc - 프로필 이미지 로딩 실패 시 표시할 대체 이미지
 * @param imageAlt - 이미지 대체 텍스트. 전달하지 않으면 사용자 이름 기반으로 생성합니다.
 */
export function Profile({
  name,
  profileImageUrl,
  fallbackImageSrc = DefaultProfileImage,
  imageAlt = `${name} 프로필 이미지`,
}: ProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <ProfileImage alt={imageAlt} fallbackSrc={fallbackImageSrc} src={profileImageUrl} />
      <span className="body-16 truncate font-medium text-white">{name}</span>
    </div>
  );
}
