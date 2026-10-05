'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { currentUserQueryOptions } from '@/entities/user';
import { ApiError } from '@/shared/api/apiError';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/shared/api/client';
import { ROUTES } from '@/shared/constants/routes';

import { consumeReturnTo, saveReturnTo } from '../model/returnTo';

interface RedirectUnauthenticatedProps {
  children: React.ReactNode;
}

/** 세션 만료 시 로그인으로 보내고, 로그인 후 원래 경로로 복귀시킵니다. */
export function RedirectUnauthenticated({ children }: RedirectUnauthenticatedProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirectedToLogin = useRef(false);
  const { data: user, error } = useQuery(currentUserQueryOptions);
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    const redirectToLogin = () => {
      if (hasRedirectedToLogin.current) {
        return;
      }

      hasRedirectedToLogin.current = true;

      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (currentPath !== ROUTES.WRITING) {
        saveReturnTo(currentPath);
      }

      router.replace(ROUTES.LOGIN);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);

    if (isUnauthorized) {
      redirectToLogin();
    }

    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
  }, [isUnauthorized, router]);

  useEffect(() => {
    if (!user || pathname !== ROUTES.WRITING) {
      return;
    }

    const returnTo = consumeReturnTo();

    if (!returnTo) {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (returnTo !== currentPath) {
      router.replace(returnTo);
    }
  }, [pathname, router, user]);

  return children;
}
