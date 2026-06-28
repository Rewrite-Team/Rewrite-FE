import { useEffect, useRef } from 'react';

interface UseFocusRestoreParams {
  enabled?: boolean;
}

/**
 * ## useFocusRestore
 *
 * @description
 * 열린 UI가 닫힐 때 열기 전 포커스가 있던 요소로 포커스를 되돌리는 hook입니다.
 * Modal, Panel처럼 사용자의 현재 작업 흐름을 잠시 가로채는 UI에서 사용합니다.
 */
export function useFocusRestore({ enabled = true }: UseFocusRestoreParams = {}) {
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (enabled && !wasEnabledRef.current) {
      previousFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    if (!enabled && wasEnabledRef.current) {
      previousFocusedElementRef.current?.focus();
      previousFocusedElementRef.current = null;
    }

    wasEnabledRef.current = enabled;
  }, [enabled]);

  useEffect(
    () => () => {
      if (wasEnabledRef.current) {
        previousFocusedElementRef.current?.focus();
      }
    },
    []
  );
}
