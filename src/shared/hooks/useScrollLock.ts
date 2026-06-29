import { useEffect } from 'react';

interface UseScrollLockParams {
  enabled?: boolean;
}

let lockCount = 0;
let previousOverflow = '';

/**
 * ## useScrollLock
 *
 * @description
 * Modal처럼 배경 스크롤을 막아야 하는 UI가 열려 있는 동안 document body 스크롤을 잠그는
 * hook입니다. 여러 UI가 동시에 열려도 마지막 잠금이 해제될 때 원래 overflow 값을 복원합니다.
 */
export function useScrollLock({ enabled = true }: UseScrollLockParams = {}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [enabled]);
}
