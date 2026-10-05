'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from '@/entities/user';
import { LogoutIcon } from '@/shared/assets/icons/common';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';

/** 로그아웃 API를 호출하고 성공하면 사용자 캐시를 지운 뒤 로그인 화면으로 이동합니다. */
export function LogoutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onError: () => appToast.error('로그아웃하지 못했습니다. 다시 시도해 주세요.'),
    onSuccess: () => {
      queryClient.clear();
      appToast.success('로그아웃되었습니다.');
      router.replace(ROUTES.LOGIN);
    },
  });

  return (
    <Button
      aria-label="로그아웃"
      className="size-9 rounded-full"
      disabled={logoutMutation.isPending}
      iconOnly
      onClick={() => logoutMutation.mutate(undefined)}
      variant="ghost"
    >
      <LogoutIcon aria-hidden className="size-5" focusable={false} />
    </Button>
  );
}
