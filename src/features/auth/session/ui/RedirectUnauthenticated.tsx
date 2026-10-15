'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { currentUserQueryOptions } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { AUTH_LOGOUT_STATE_EVENT, AUTH_SESSION_EXPIRED_EVENT } from '@/shared/api/base/client';
import { ROUTES } from '@/shared/constants/routes';

import { useLoginDestination } from '../hooks/useLoginDestination';
import { clearReturnTo, saveReturnTo } from '../model/returnTo';

interface RedirectUnauthenticatedProps {
  children: React.ReactNode;
}

/** 세션 만료 시 로그인으로 보내고, 로그인 후 원래 경로로 복귀시킵니다. */
export function RedirectUnauthenticated({ children }: RedirectUnauthenticatedProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const getLoginDestination = useLoginDestination();
  const hasResolvedLoginDestination = useRef(false);
  const hasRedirectedToLogin = useRef(false);
  const isExplicitLogout = useRef(false);
  const { data: user, error } = useQuery(currentUserQueryOptions);
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    const redirectToLogin = () => {
      if (hasRedirectedToLogin.current) {
        return;
      }

      hasRedirectedToLogin.current = true;

      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (!isExplicitLogout.current && currentPath !== ROUTES.WRITING) {
        saveReturnTo(currentPath);
      }

      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    };

    const handleLogoutState = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      isExplicitLogout.current = event.detail === true;

      if (isExplicitLogout.current) {
        clearReturnTo();
      }
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
    window.addEventListener(AUTH_LOGOUT_STATE_EVENT, handleLogoutState);

    if (isUnauthorized) {
      redirectToLogin();
    }

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
      window.removeEventListener(AUTH_LOGOUT_STATE_EVENT, handleLogoutState);
    };
  }, [isUnauthorized, queryClient, router]);

  useEffect(() => {
    if (!user || pathname !== ROUTES.WRITING || hasResolvedLoginDestination.current) {
      return;
    }

    hasResolvedLoginDestination.current = true;

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const destination = getLoginDestination(currentPath);

    if (destination !== currentPath) {
      router.replace(destination);
    }
  }, [getLoginDestination, pathname, router, user]);

  return children;
}
