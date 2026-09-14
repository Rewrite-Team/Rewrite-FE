import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UseOutsideClickParams<TElement extends HTMLElement> {
  enabled?: boolean;
  onOutsideClick: (event: PointerEvent) => void;
  ref: RefObject<TElement | null>;
}

/**
 * ## useOutsideClick
 *
 * @description
 * 지정한 요소 바깥에서 발생한 pointer down 이벤트를 감지하는 공통 hook입니다.
 * Modal Content 바깥 클릭처럼 외부 영역 상호작용을 닫기 요청으로 변환할 때 사용합니다.
 *
 * @param enabled - 이벤트 리스너 활성화 여부
 * @param ref - 내부 영역으로 판단할 요소 ref
 * @param onOutsideClick - ref 바깥에서 pointer down이 발생했을 때 실행할 콜백
 */
export function useOutsideClick<TElement extends HTMLElement>({
  enabled = true,
  onOutsideClick,
  ref,
}: UseOutsideClickParams<TElement>) {
  const callbackRef = useRef(onOutsideClick);

  useEffect(() => {
    callbackRef.current = onOutsideClick;
  }, [onOutsideClick]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const element = ref.current;
      const target = event.target;

      if (!element || !(target instanceof Node) || element.contains(target)) {
        return;
      }

      callbackRef.current(event);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [enabled, ref]);
}
