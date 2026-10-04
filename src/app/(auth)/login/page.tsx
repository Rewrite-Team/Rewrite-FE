import { Login, type KakaoLoginErrorCode } from '@/widgets/auth/login';

import type { Metadata } from 'next';

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

const getKakaoLoginErrorCode = (value: string | undefined): KakaoLoginErrorCode | undefined => {
  if (value === 'KAKAO_LOGIN_CANCELED' || value === 'KAKAO_LOGIN_FAILED') {
    return value;
  }

  return undefined;
};

export const metadata: Metadata = {
  title: '로그인 | Re:write',
  description: '카카오 로그인으로 Re:write의 자기소개서 첨삭과 면접 연습을 시작하세요.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;
  const kakaoLoginError = getKakaoLoginErrorCode(errorCode);
  const isLocalDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Login
      kakaoLoginError={kakaoLoginError}
      kakaoLoginTarget={isLocalDevelopment ? 'local' : 'production'}
    />
  );
}
