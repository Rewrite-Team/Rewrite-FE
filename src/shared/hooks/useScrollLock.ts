import { useScrollLock as useBaseUIScrollLock } from '@base-ui/utils/useScrollLock';

interface UseScrollLockParams {
  enabled?: boolean;
}

/**
 * ## useScrollLock
 *
 * @description
 * Modal처럼 배경 스크롤을 막아야 하는 UI가 열려 있는 동안 문서 스크롤을 잠그는 hook입니다.
 * Base UI와 동일한 전역 잠금 관리자를 사용하므로 여러 Overlay가 중첩되어도
 * 마지막 잠금이 해제될 때 원래 스크롤 상태를 복원합니다.
 */
export function useScrollLock({ enabled = true }: UseScrollLockParams = {}) {
  useBaseUIScrollLock(enabled);
}
