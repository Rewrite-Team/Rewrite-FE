import { useEffect } from 'react';
import type { RefObject } from 'react';

interface UseFocusTrapParams<TElement extends HTMLElement> {
  enabled?: boolean;
  ref: RefObject<TElement | null>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisible = (element: HTMLElement) =>
  element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      !element.hidden &&
      element.getAttribute('aria-hidden') !== 'true' &&
      isVisible(element)
  );

/**
 * ## useFocusTrap
 *
 * @description
 * Tab 키 이동을 특정 컨테이너 내부로 제한하고, 열릴 때 첫 포커스 대상 또는 컨테이너로
 * 포커스를 이동하는 hook입니다.
 */
export function useFocusTrap<TElement extends HTMLElement>({
  enabled = true,
  ref,
}: UseFocusTrapParams<TElement>) {
  useEffect(() => {
    const container = ref.current;

    if (!enabled || !container) {
      return;
    }

    const focusableElements = getFocusableElements(container);
    const initialFocusElement = focusableElements[0] ?? container;

    initialFocusElement.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusableElements = getFocusableElements(container);

      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1];
      const activeElement = document.activeElement;
      const activeFocusableElement =
        activeElement instanceof HTMLElement && currentFocusableElements.includes(activeElement)
          ? activeElement
          : null;

      if (!activeFocusableElement) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && activeFocusableElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeFocusableElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, ref]);
}
