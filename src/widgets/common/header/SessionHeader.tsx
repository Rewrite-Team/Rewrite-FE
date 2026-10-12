'use client';

import { useQuery } from '@tanstack/react-query';

import { currentUserQueryOptions } from '@/entities/user';
import { LogoutButton } from '@/features/auth/logout';

import { Header } from './Header';

/** API 세션을 조회해 로그인 상태에 맞는 Header를 구성합니다. */
export function SessionHeader() {
  const { data: user, isPending } = useQuery(currentUserQueryOptions);

  return (
    <Header
      authenticatedAction={user ? <LogoutButton /> : undefined}
      isUserLoading={isPending}
      user={user ? { name: user.nickname, profileImageUrl: user.profileImageUrl } : null}
    />
  );
}
