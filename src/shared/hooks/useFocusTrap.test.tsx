import { createRef } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { useFocusTrap } from './useFocusTrap';

function FocusTrapFixture() {
  const containerRef = createRef<HTMLDivElement>();

  useFocusTrap({
    ref: containerRef,
  });

  return (
    <>
      <button type="button">외부 버튼</button>
      <div ref={containerRef} tabIndex={-1}>
        <button type="button">첫 번째 버튼</button>
        <button type="button">마지막 버튼</button>
      </div>
    </>
  );
}

describe('useFocusTrap', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
      configurable: true,
      value: function getClientRects() {
        return this.hidden ? [] : [{ height: 1, width: 1 }];
      },
    });
  });

  it('moves focus back to the first focusable element when focus is outside the container', () => {
    render(<FocusTrapFixture />);

    const outsideButton = screen.getByRole('button', { name: '외부 버튼' });
    const firstButton = screen.getByRole('button', { name: '첫 번째 버튼' });

    act(() => {
      outsideButton.focus();
    });

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(firstButton).toHaveFocus();
  });

  it('moves focus back to the last focusable element on Shift+Tab when focus is outside the container', () => {
    render(<FocusTrapFixture />);

    const outsideButton = screen.getByRole('button', { name: '외부 버튼' });
    const lastButton = screen.getByRole('button', { name: '마지막 버튼' });

    act(() => {
      outsideButton.focus();
    });

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(lastButton).toHaveFocus();
  });
});
