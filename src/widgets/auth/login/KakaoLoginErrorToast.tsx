'use client';

import { useEffect } from 'react';

import { appToast } from '@/shared/lib/toast';

export type KakaoLoginErrorCode = 'KAKAO_LOGIN_CANCELED' | 'KAKAO_LOGIN_FAILED';

interface KakaoLoginErrorToastProps {
  errorCode?: KakaoLoginErrorCode;
}

const KAKAO_LOGIN_ERROR_MESSAGES: Record<KakaoLoginErrorCode, string> = {
  KAKAO_LOGIN_CANCELED: '카카오 로그인이 취소되었습니다. 다시 시도해 주세요.',
  KAKAO_LOGIN_FAILED: '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

/** 카카오 로그인 실패 상태를 전역 오류 Toast로 알립니다. */
export function KakaoLoginErrorToast({ errorCode }: KakaoLoginErrorToastProps) {
  useEffect(() => {
    if (!errorCode) {
      return;
    }

    appToast.error(KAKAO_LOGIN_ERROR_MESSAGES[errorCode]);
  }, [errorCode]);

  return null;
}
