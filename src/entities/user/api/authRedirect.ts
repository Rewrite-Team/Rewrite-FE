import { getClientApiBaseUrl } from '@/shared/api/config';

export type KakaoLoginTarget = 'local' | 'production';

/** 백엔드 카카오 로그인 시작 endpoint의 브라우저 이동 URL을 반환합니다. */
export const getStartKakaoLoginUrl = (target: KakaoLoginTarget) => {
  const url = new URL('/auth/kakao/authorize', getClientApiBaseUrl());
  const searchParams = new URLSearchParams();

  searchParams.set('target', target);

  url.search = searchParams.toString();

  return url.toString();
};
