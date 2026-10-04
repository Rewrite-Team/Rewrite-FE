'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { currentUserQueryOptions } from '@/entities/user';
import { ApiError } from '@/shared/api/apiError';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';

import { consumeReturnTo, saveReturnTo } from '../model/returnTo';

interface RequireAuthProps {
  children: React.ReactNode;
}

/** 로그인 사용자의 세션을 확인하고 비로그인 사용자를 로그인으로 보냅니다. */
export function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, error, isError, isPending, refetch } = useQuery(currentUserQueryOptions);
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== ROUTES.WRITING) {
      saveReturnTo(currentPath);
    }

    router.replace(ROUTES.LOGIN);
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

    if (returnTo === currentPath) {
      return;
    }

    router.replace(returnTo);
  }, [pathname, router, user]);

  if (isPending || isUnauthorized) {
    return <AuthStatus>로그인 상태를 확인하고 있습니다.</AuthStatus>;
  }

  if (isError || !user) {
    return (
      <section
        aria-labelledby="auth-check-error-title"
        className="flex min-h-80 flex-col items-center justify-center gap-4 text-center"
        role="alert"
      >
        <h1 className="heading-24" id="auth-check-error-title">
          로그인 상태를 확인하지 못했습니다.
        </h1>
        <p className="body-16 text-gray-200">네트워크 상태를 확인한 뒤 다시 시도해 주세요.</p>
        <Button onClick={() => void refetch()} variant="primary">
          다시 시도
        </Button>
      </section>
    );
  }

  return children;
}

function AuthStatus({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-busy="true"
      className="flex min-h-80 flex-1 items-center justify-center body-16 text-gray-200"
      role="status"
    >
      {children}
    </div>
  );
}
