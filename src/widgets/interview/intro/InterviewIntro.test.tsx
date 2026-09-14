import { fireEvent, render, screen } from '@testing-library/react';

import { InterviewIntro } from './InterviewIntro';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/ui/lottie-animation', () => ({
  LottieAnimation: () => null,
}));

describe('InterviewIntro', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('모의면접 시작 버튼을 누르면 해당 자기소개서의 면접 세션으로 이동한다', () => {
    render(<InterviewIntro writingId="writing-1" />);

    fireEvent.click(screen.getByRole('button', { name: '모의면접 시작하기' }));

    expect(mockPush).toHaveBeenCalledWith('/writing/writing-1/interview/session');
  });
});
