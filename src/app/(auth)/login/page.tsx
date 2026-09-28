import { Login } from '@/widgets/auth/login';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | Re:write',
  description: '카카오 로그인으로 Re:write의 자기소개서 첨삭과 면접 연습을 시작하세요.',
};

export default function LoginPage() {
  return <Login />;
}
