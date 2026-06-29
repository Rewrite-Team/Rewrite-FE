'use client';

import { useEffect, useSyncExternalStore } from 'react';

const surfaceStack: string[] = [];
const listeners = new Set<() => void>();

/**
 * Surface stack 변경을 구독 중인 hook들에게 알립니다.
 *
 * @description
 * `useSyncExternalStore` 기반 구독자에게 현재 최상단 Surface가 바뀌었음을 알리는 내부 함수입니다.
 */
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

/**
 * Surface stack 변경을 구독합니다.
 *
 * @param listener - stack 변경 시 실행할 콜백
 * @returns 구독 해제 함수
 */
const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

/**
 * 현재 최상단 Surface id를 반환합니다.
 *
 * @returns stack의 마지막 Surface id. 열린 Surface가 없으면 null을 반환합니다.
 */
const getSnapshot = () => surfaceStack.at(-1) ?? null;

/**
 * 서버 렌더링 중 사용할 기본 snapshot입니다.
 *
 * @returns 서버에서는 열린 Surface를 판단하지 않으므로 null을 반환합니다.
 */
const getServerSnapshot = () => null;

/**
 * 열린 Surface를 stack에 등록합니다.
 *
 * @description
 * Surface가 열릴 때 id를 stack 마지막에 추가하여 최상단 Surface로 취급합니다.
 * 닫히거나 unmount되면 등록했던 id를 제거합니다.
 *
 * @param id - 열린 Surface의 content id
 * @returns stack에서 해당 Surface를 제거하는 cleanup 함수
 */
const registerSurface = (id: string) => {
  surfaceStack.push(id);
  notifyListeners();

  return () => {
    const index = surfaceStack.lastIndexOf(id);

    if (index >= 0) {
      surfaceStack.splice(index, 1);
      notifyListeners();
    }
  };
};

/**
 * 현재 Surface가 열린 Surface stack의 최상단인지 판단합니다.
 *
 * @description
 * ESC, outside click, focus trap 같은 전역 interaction이 여러 Surface에 동시에 적용되지 않도록
 * 최상단 Surface 여부를 반환합니다. `enabled`가 false이면 stack에 등록하지 않고 false를 반환합니다.
 *
 * @param id - Surface Content id
 * @param enabled - Surface가 열려 있어 stack에 등록되어야 하는지 여부
 * @returns 현재 Surface가 최상단이면 true, 아니면 false
 */
function useSurfaceStack(id: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return registerSurface(id);
  }, [enabled, id]);

  const topSurfaceId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return enabled && topSurfaceId === id;
}

export { useSurfaceStack };
