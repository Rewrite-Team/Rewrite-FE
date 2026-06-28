import { act, renderHook } from '@testing-library/react';

import { useControllableState } from './useControllableState';

describe('useControllableState', () => {
  it('manages internal state when value is uncontrolled', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: false,
        onChange,
      })
    );

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(result.current[2]).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('uses external state when value is controlled', () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState({
          defaultValue: false,
          onChange,
          value,
        }),
      {
        initialProps: {
          value: false,
        },
      }
    );

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(false);
    expect(result.current[2]).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender({ value: true });

    expect(result.current[0]).toBe(true);
  });

  it('supports functional updates', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: 1,
        onChange,
      })
    );

    act(() => {
      result.current[1]((previousValue) => previousValue + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not call onChange when next value is equal to current value', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: 'open',
        onChange,
      })
    );

    act(() => {
      result.current[1]('open');
    });

    expect(result.current[0]).toBe('open');
    expect(onChange).not.toHaveBeenCalled();
  });
});
