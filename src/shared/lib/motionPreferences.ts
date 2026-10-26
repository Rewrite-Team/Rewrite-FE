const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

/** 사용자의 시스템 모션 감소 설정을 반환합니다. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.(REDUCED_MOTION_MEDIA_QUERY).matches ?? false);

/** 시스템 설정에 따라 자동 스크롤 동작을 반환합니다. */
export const getPreferredScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? 'auto' : 'smooth';
