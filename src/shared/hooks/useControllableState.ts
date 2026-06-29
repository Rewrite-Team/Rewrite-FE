import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface UseControllableStateParams<TValue> {
  defaultValue: TValue | (() => TValue);
  onChange?: (value: TValue) => void;
  value?: TValue;
}

/**
 * ## useControllableState
 *
 * @description
 * controlled와 uncontrolled 방식을 모두 지원해야 하는 공통 UI에서 사용하는 상태 훅입니다.
 * `value`가 전달되면 외부 상태를 기준으로 동작하고, 생략되면 `defaultValue`로 내부 상태를
 * 초기화합니다.
 *
 * ### 주요 내용
 *
 * Modal, Panel, Accordion처럼 `open`/`defaultOpen`/`onOpenChange` API를 제공하는
 * 컴포넌트에서 상태 관리 방식을 일관되게 유지하기 위해 사용합니다.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useControllableState({
 *   value: open,
 *   defaultValue: defaultOpen,
 *   onChange: onOpenChange,
 * });
 * ```
 */
export function useControllableState<TValue>({
  defaultValue,
  onChange,
  value,
}: UseControllableStateParams<TValue>) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const uncontrolledValueRef = useRef(uncontrolledValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue: Dispatch<SetStateAction<TValue>> = useCallback(
    (nextValueOrUpdater) => {
      const previousValue = isControlled ? currentValue : uncontrolledValueRef.current;
      const nextValue =
        typeof nextValueOrUpdater === 'function'
          ? (nextValueOrUpdater as (previousValue: TValue) => TValue)(previousValue)
          : nextValueOrUpdater;

      if (Object.is(previousValue, nextValue)) {
        return;
      }

      if (!isControlled) {
        uncontrolledValueRef.current = nextValue;
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [currentValue, isControlled, onChange]
  );

  return [currentValue, setValue, isControlled] as const;
}
