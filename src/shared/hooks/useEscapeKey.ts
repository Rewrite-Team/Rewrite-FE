import { useEffect, useRef } from 'react';

interface UseEscapeKeyParams {
  enabled?: boolean;
  onEscapeKeyDown: (event: KeyboardEvent) => void;
}

/**
 * ## useEscapeKey
 *
 * @description
 * ESC 키 입력을 감지하는 공통 hook입니다. Modal, Panel처럼 열려 있는 UI가 ESC로
 * 닫혀야 할 때 사용하며, 실제 닫힘 가능 여부는 호출하는 컴포넌트의 정책에서 판단합니다.
 *
 * @param enabled - 이벤트 리스너 활성화 여부
 * @param onEscapeKeyDown - ESC 키가 눌렸을 때 실행할 콜백
 */
export function useEscapeKey({ enabled = true, onEscapeKeyDown }: UseEscapeKeyParams) {
  const callbackRef = useRef(onEscapeKeyDown);

  useEffect(() => {
    callbackRef.current = onEscapeKeyDown;
  }, [onEscapeKeyDown]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape' || event.isComposing) {
        return;
      }

      callbackRef.current(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
