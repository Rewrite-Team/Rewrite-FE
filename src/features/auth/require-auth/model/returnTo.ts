import { ROUTES } from '@/shared/constants/routes';

const RETURN_TO_STORAGE_KEY = 'rewrite.auth.return-to:v1';

export const saveReturnTo = (path: string) => {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return;
  }

  try {
    window.sessionStorage.setItem(RETURN_TO_STORAGE_KEY, path);
  } catch {
    // 로그인 복귀 경로 저장은 sessionStorage를 사용할 수 없는 환경에서는 생략합니다.
  }
};

export const consumeReturnTo = () => {
  try {
    const path = window.sessionStorage.getItem(RETURN_TO_STORAGE_KEY);
    window.sessionStorage.removeItem(RETURN_TO_STORAGE_KEY);

    if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
      return undefined;
    }

    const returnToUrl = new URL(path, window.location.origin);

    if (returnToUrl.origin !== window.location.origin || returnToUrl.pathname === ROUTES.LOGIN) {
      return undefined;
    }

    return `${returnToUrl.pathname}${returnToUrl.search}${returnToUrl.hash}`;
  } catch {
    return undefined;
  }
};
