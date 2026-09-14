import { PORTAL_ROOT_ID } from '@/shared/constants/portal';

/**
 * 앱 전역 Portal Root를 반환합니다.
 *
 * @description
 * Storybook이나 테스트처럼 Portal Root가 없는 환경에서는 document body를 사용하고,
 * 서버 환경에서는 null을 반환합니다.
 */
const getDefaultPortalContainer = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.getElementById(PORTAL_ROOT_ID) ?? document.body;
};

export { getDefaultPortalContainer };
