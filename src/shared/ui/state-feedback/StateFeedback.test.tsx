import { render, screen } from '@testing-library/react';

import { StateFeedback } from './StateFeedback';

jest.mock('@/shared/ui/lottie-animation', () => ({
  LottieAnimation: () => null,
}));

describe('StateFeedback', () => {
  it('단일 CTA를 부모 너비 안에서 최대 너비까지 표시한다', () => {
    render(
      <StateFeedback
        action={{ label: '계속하기', onClick: jest.fn() }}
        title="다음 단계로 이동하세요"
      />
    );

    const actionButton = screen.getByRole('button', { name: '계속하기' });

    expect(actionButton).toHaveClass('w-full');
    expect(actionButton.parentElement).toHaveClass('w-full', 'max-w-88');
  });
});
