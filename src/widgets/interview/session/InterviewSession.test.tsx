import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { appToast } from '@/shared/lib/toast';

import { InterviewSession } from './InterviewSession';

jest.mock('@/shared/assets/icons/common', () => ({
  CancelIcon: 'svg',
  CheckIcon: 'svg',
}));

jest.mock('@/shared/assets/icons/interview', () => ({
  CopyIcon: 'svg',
  ListenIcon: 'svg',
  SendIcon: 'svg',
  SideBarIcon: 'svg',
  VoiceRecordIcon: 'svg',
}));

jest.mock('@/shared/lib/toast', () => ({
  appToast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const scrollTo = jest.fn();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  });
});

beforeEach(() => {
  scrollTo.mockClear();
});

describe('InterviewSession', () => {
  it('질문 목록을 열고 닫는다', () => {
    render(<InterviewSession />);

    const closeButton = screen.getByRole('button', { name: '질문 목록 닫기' });

    expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('heading', { name: '질문 목록' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '질문 1개 추가하기' })).toBeInTheDocument();

    fireEvent.click(closeButton);

    const openButton = screen.getByRole('button', { name: '질문 목록 열기' });

    expect(openButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(openButton);

    expect(screen.getByRole('button', { name: '질문 목록 닫기' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('질문을 선택하면 해당 질문의 대화로 전환한다', () => {
    render(<InterviewSession />);

    const selectedQuestion = screen.getByRole('button', {
      name: '프로젝트에서 가장 어려웠던 문제와 해결 과정을 설명해 주세요.',
    });

    fireEvent.click(selectedQuestion);

    const conversation = screen.getByRole('list', { name: '면접 대화' });

    expect(
      within(conversation).getByText('프로젝트에서 가장 어려웠던 문제와 해결 과정을 설명해 주세요.')
    ).toBeInTheDocument();
    expect(
      within(conversation).queryByText('지원 동기와 입사 후 이루고 싶은 목표를 말씀해 주세요.')
    ).not.toBeInTheDocument();
    expect(selectedQuestion).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: '질문 목록 열기' })).toBeInTheDocument();
  });

  it('질문을 추가하면 질문 목록을 열린 상태로 유지하고 맨 아래로 스크롤한다', async () => {
    render(<InterviewSession />);

    const questionList = screen.getByRole('list', { name: '면접 질문 목록' });
    const questionListScrollTo = jest.fn();

    Object.defineProperty(questionList, 'scrollHeight', {
      configurable: true,
      value: 560,
    });
    Object.defineProperty(questionList, 'scrollTo', {
      configurable: true,
      value: questionListScrollTo,
    });
    fireEvent.click(screen.getByRole('button', { name: '질문 1개 추가하기' }));

    expect(screen.getByRole('button', { name: '질문 목록 닫기' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(
      within(screen.getByRole('list', { name: '면접 대화' })).getByText(
        '새로운 질문을 입력해 주세요.'
      )
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(questionListScrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 560 });
    });
  });

  it('질문이나 메시지가 추가되면 대화 목록을 맨 아래로 스크롤한다', async () => {
    render(<InterviewSession />);

    const conversation = screen.getByRole('list', { name: '면접 대화' });
    const conversationScrollTo = jest.fn();

    Object.defineProperty(conversation, 'scrollHeight', {
      configurable: true,
      value: 640,
    });
    Object.defineProperty(conversation, 'scrollTo', {
      configurable: true,
      value: conversationScrollTo,
    });
    fireEvent.click(screen.getByRole('button', { name: '질문 1개 추가하기' }));

    await waitFor(() => {
      expect(conversationScrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', top: 640 });
    });

    Object.defineProperty(conversation, 'scrollHeight', {
      configurable: true,
      value: 720,
    });
    conversationScrollTo.mockClear();
    fireEvent.change(screen.getByRole('textbox', { name: '면접 답변' }), {
      target: { value: '새 답변입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 전송' }));

    await waitFor(() => {
      expect(conversationScrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', top: 720 });
    });
  });

  it('모든 채팅의 듣기와 복사 버튼을 오른쪽에 배치한다', () => {
    render(<InterviewSession />);

    const conversation = screen.getByRole('list', { name: '면접 대화' });
    const aiActions = screen.getAllByRole('button', { name: 'AI 질문 듣기' })[0].parentElement;
    const userActions = screen.getAllByRole('button', { name: '내 답변 듣기' })[0].parentElement;

    expect(conversation).toHaveClass('gap-8');
    expect(aiActions).toHaveClass('right-0', 'justify-end');
    expect(userActions).toHaveClass('right-0', 'justify-end');
    expect(screen.getAllByRole('button', { name: 'AI 질문 복사하기' })).not.toHaveLength(0);
    expect(screen.getAllByRole('button', { name: '내 답변 복사하기' })).not.toHaveLength(0);
  });

  it('메시지를 복사하면 완료 토스트를 표시한다', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<InterviewSession />);

    fireEvent.click(screen.getAllByRole('button', { name: 'AI 질문 복사하기' })[0]);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        '지원 동기와 입사 후 이루고 싶은 목표를 말씀해 주세요.'
      );
      expect(appToast.success).toHaveBeenCalledWith('복사되었습니다.');
    });
  });

  it('입력한 답변을 대화 목록에 추가하고 입력창을 비운다', () => {
    render(<InterviewSession />);

    const answerInput = screen.getByRole('textbox', { name: '면접 답변' });

    fireEvent.change(answerInput, { target: { value: '새로운 면접 답변입니다.' } });
    fireEvent.click(screen.getByRole('button', { name: '답변 전송' }));

    expect(screen.getByText('새로운 면접 답변입니다.')).toBeInTheDocument();
    expect(answerInput).toHaveValue('');
  });

  it('음성 입력을 시작하고 취소한다', () => {
    render(<InterviewSession />);

    fireEvent.click(screen.getByRole('button', { name: '음성 입력 시작' }));

    expect(screen.getByRole('button', { name: '음성 입력 취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '음성 입력 완료' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '면접 답변' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '음성 입력 취소' }));

    expect(screen.getByRole('textbox', { name: '면접 답변' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '음성 입력 시작' })).toBeInTheDocument();
  });
});
