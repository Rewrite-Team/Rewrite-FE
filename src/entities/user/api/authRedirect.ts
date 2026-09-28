export type KakaoLoginTarget = 'local' | 'production';

export interface StartKakaoLoginParams {
  target?: KakaoLoginTarget;
}

/** 브라우저 이동에 사용하는 카카오 로그인 시작 경로를 반환합니다. */
export const getStartKakaoLoginUrl = (params?: StartKakaoLoginParams) => {
  const searchParams = new URLSearchParams();

  if (params?.target) {
    searchParams.set('target', params.target);
  }

  const query = searchParams.toString();

  return query ? `/auth/kakao/authorize?${query}` : '/auth/kakao/authorize';
};
