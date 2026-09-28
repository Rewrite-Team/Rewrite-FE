import type { ComponentPropsWithoutRef } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ROUTES } from '@/shared/constants/routes';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterQuestionForm } from './CoverLetterQuestionForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/assets/icons/common', () => ({
  AltArrowDownIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

jest.mock('@/shared/assets/icons/side-menu', () => ({
  DeleteIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

describe('CoverLetterQuestionForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('첫 번째 문항 하나를 펼친 상태로 렌더링한다', () => {
    render(<CoverLetterQuestionForm />);

    const form = screen.getByRole('form', { name: '자기소개서 문항 및 답변' });
    const firstTrigger = screen.getByRole('button', {
      name: '1번 자기소개서 문항 접기 또는 펼치기',
    });

    expect(form).toHaveAttribute('id', COVER_LETTER_STEP_FORM_ID);
    expect(form).toHaveAttribute('novalidate');
    expect(screen.getAllByRole('textbox', { name: '질문' })).toHaveLength(1);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: '자기소개서 내용' })).toBeVisible();
    expect(
      screen.getAllByText((_, element) => element?.tagName === 'P' && element.textContent === '0자')
    ).toHaveLength(1);
  });

  it('다른 문항을 펼치면 기존 문항을 접는다', () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));

    const firstTrigger = screen.getByRole('button', {
      name: '1번 자기소개서 문항 접기 또는 펼치기',
    });
    const secondTrigger = screen.getByRole('button', {
      name: '2번 자기소개서 문항 접기 또는 펼치기',
    });

    fireEvent.click(firstTrigger);

    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('문항을 추가하면 두 번째 문항을 펼친다', () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));

    expect(screen.getAllByRole('textbox', { name: '질문' })).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: '2번 자기소개서 문항 접기 또는 펼치기' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('문항이 하나뿐이면 삭제 버튼을 비활성화한다', () => {
    render(<CoverLetterQuestionForm />);

    expect(screen.getByRole('button', { name: '1번 자기소개서 문항 삭제' })).toBeDisabled();
  });

  it('문항을 삭제하면 폼 값과 순서를 함께 업데이트한다', () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.change(screen.getByRole('textbox', { name: '질문' }), {
      target: { value: '첫 번째 질문' },
    });
    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));
    fireEvent.change(screen.getAllByRole('textbox', { name: '질문' })[1], {
      target: { value: '두 번째 질문' },
    });
    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));
    fireEvent.change(screen.getAllByRole('textbox', { name: '질문' })[2], {
      target: { value: '세 번째 질문' },
    });

    fireEvent.click(screen.getByRole('button', { name: '2번 자기소개서 문항 삭제' }));

    expect(screen.getAllByRole('textbox', { name: '질문' })).toHaveLength(2);
    expect(screen.getAllByRole('textbox', { name: '질문' })[0]).toHaveValue('첫 번째 질문');
    expect(screen.getAllByRole('textbox', { name: '질문' })[1]).toHaveValue('세 번째 질문');
    expect(
      screen.getByRole('button', { name: '2번 자기소개서 문항 접기 또는 펼치기' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.queryByRole('button', { name: '3번 자기소개서 문항 삭제' })
    ).not.toBeInTheDocument();
  });

  it('문항 삭제 후 적용한 글자 수를 남은 문항과 동기화한다', async () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: '자기소개서 글자 수' }), {
      target: { value: '900' },
    });
    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    expect(
      await screen.findByText(
        (_, element) => element?.tagName === 'P' && element.textContent === '0/900자'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '1번 자기소개서 문항 삭제' }));

    expect(screen.getByRole('spinbutton', { name: '자기소개서 글자 수' })).toHaveValue(900);
    expect(
      screen.getByText(
        (_, element) => element?.tagName === 'P' && element.textContent === '0/900자'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1번 자기소개서 문항 삭제' })).toBeDisabled();
  });

  it('오류가 있는 문항을 삭제하면 남은 폼 상태만 검증한다', async () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.click(screen.getByRole('button', { name: '문항 추가' }));
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 문항 및 답변' }));

    expect(await screen.findAllByText('자기소개서 질문을 입력해주세요.')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '2번 자기소개서 문항 삭제' }));
    fireEvent.change(screen.getByRole('textbox', { name: '질문' }), {
      target: { value: '지원 동기를 작성해주세요.' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '자기소개서 내용' }), {
      target: { value: '지원 동기에 대한 답변입니다.' },
    });
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 문항 및 답변' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(4));
    });
  });

  it('입력한 글자 수를 답변의 권장 길이에 적용한다', async () => {
    render(<CoverLetterQuestionForm />);

    const characterLimitField = screen.getByRole('spinbutton', {
      name: '자기소개서 글자 수',
    });

    fireEvent.change(characterLimitField, { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    expect(
      await screen.findByText(
        (_, element) => element?.tagName === 'P' && element.textContent === '0/1200자'
      )
    ).toBeInTheDocument();
  });

  it('글자 수를 적용하기 전에는 현재 작성한 글자 수만 표시한다', () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.change(screen.getByRole('textbox', { name: '자기소개서 내용' }), {
      target: { value: '테스트' },
    });

    expect(
      screen.getByText((_, element) => element?.tagName === 'P' && element.textContent === '3자')
    ).toBeInTheDocument();
  });

  it('빈 폼을 제출하면 오류를 표시하고 이동하지 않는다', async () => {
    render(<CoverLetterQuestionForm />);

    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 문항 및 답변' }));

    expect(await screen.findAllByText('자기소개서 질문을 입력해주세요.')).not.toHaveLength(0);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('모든 필수 항목을 입력하고 제출하면 STEP4로 이동한다', async () => {
    const { container } = render(<CoverLetterQuestionForm />);
    const questionFields = screen.getAllByRole('textbox', { name: '질문' });
    const answerFields = container.querySelectorAll<HTMLTextAreaElement>('textarea');

    fireEvent.change(questionFields[0], { target: { value: '지원 동기를 작성해주세요.' } });
    fireEvent.change(answerFields[0], { target: { value: '첫 번째 답변입니다.' } });
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 문항 및 답변' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(4));
    });
  });
});
