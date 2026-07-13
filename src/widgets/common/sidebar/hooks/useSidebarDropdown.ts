import { useEffect, useId, useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

import { useEscapeKey, useOutsideClick } from '@/shared/hooks';

interface UseSidebarDropdownParams {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * ## useSidebarDropdown
 *
 * @description
 * Sidebar 분석 드롭다운의 외부 클릭, Escape 닫힘, 포커스 복귀와 키보드 탐색을 관리합니다.
 * UI 마크업과 접근성 인터랙션을 분리하기 위해 SidebarDropdown 내부에서 사용합니다.
 *
 * ### 키보드 동작
 *
 * 닫힌 트리거에서 방향키를 누르면 첫 항목 또는 마지막 항목으로 진입합니다. 열린 상태에서는
 * 위·아래 방향키로 항목을 순환하고 Home/End로 처음과 마지막 항목에 이동합니다.
 *
 * @param isOpen - 드롭다운의 현재 열림 상태
 * @param onClose - 드롭다운 닫힘을 요청하는 콜백
 * @param onToggle - 드롭다운 열림 상태 변경을 요청하는 콜백
 */
export function useSidebarDropdown({ isOpen, onClose, onToggle }: UseSidebarDropdownParams) {
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLLIElement>(null);
  const pendingFocusRef = useRef<'first' | 'last' | null>(null);

  const getDropdownLinks = () =>
    Array.from(dropdownRef.current?.querySelectorAll<HTMLAnchorElement>('ul a[href]') ?? []);

  const getTrigger = () =>
    dropdownRef.current?.querySelector<HTMLButtonElement>('button[aria-controls]');

  const handleCloseAndRestoreFocus = () => {
    onClose();
    getTrigger()?.focus();
  };

  useEffect(() => {
    if (!isOpen || !pendingFocusRef.current) {
      return;
    }

    const links = getDropdownLinks();
    const target = pendingFocusRef.current === 'first' ? links.at(0) : links.at(-1);

    pendingFocusRef.current = null;
    target?.focus();
  }, [isOpen]);

  useOutsideClick({ enabled: isOpen, onOutsideClick: onClose, ref: dropdownRef });
  useEscapeKey({ enabled: isOpen, onEscapeKeyDown: handleCloseAndRestoreFocus });

  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      isOpen &&
      !(nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement))
    ) {
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    const isTriggerFocused = event.target === getTrigger();

    if (!isOpen && isTriggerFocused && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      pendingFocusRef.current = event.key === 'ArrowDown' ? 'first' : 'last';
      onToggle();
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleCloseAndRestoreFocus();
      return;
    }

    const links = getDropdownLinks();
    const focusedIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === 'Home' || event.key === 'End') {
      if (focusedIndex < 0) {
        return;
      }

      event.preventDefault();
      links.at(event.key === 'Home' ? 0 : -1)?.focus();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();

    if (isTriggerFocused) {
      links.at(event.key === 'ArrowDown' ? 0 : -1)?.focus();
      return;
    }

    if (focusedIndex < 0) {
      return;
    }

    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (focusedIndex + direction + links.length) % links.length;
    links[nextIndex]?.focus();
  };

  return { dropdownId, dropdownRef, handleBlur, handleKeyDown };
}
