import type { ComponentPropsWithoutRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterReviewForm } from './CoverLetterReviewForm';

jest.mock('@/shared/assets/icons/common', () => ({
  AltArrowDownIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

describe('CoverLetterReviewForm', () => {
  it('이전 단계의 자기소개서 정보를 읽기 전용으로 표시한다', () => {
    render(<CoverLetterReviewForm />);

    const form = screen.getByRole('form', { name: '자기소개서 최종 확인' });

    expect(form).toHaveAttribute('id', COVER_LETTER_STEP_FORM_ID);
    expect(screen.getByRole('textbox', { name: '자기소개서 제목' })).toHaveValue(
      '카카오 자기소개서'
    );
    expect(screen.getByRole('textbox', { name: '회사명' })).toHaveValue('카카오');
    expect(screen.getByRole('textbox', { name: '희망 직무' })).toHaveValue('프론트엔드 개발자');
    expect(screen.getByRole('textbox', { name: '공고 우대사항' })).toHaveValue(
      '착하고 착하고 착한 사람 찾아요~!'
    );

    screen.getAllByRole('textbox').forEach((field) => {
      expect(field).toHaveAttribute('readonly');
    });
  });

  it('문항과 답변 및 적용된 글자 수를 표시한다', () => {
    render(<CoverLetterReviewForm />);

    expect(screen.getByRole('textbox', { name: '질문' })).toHaveValue('이름이 무엇입니까?');
    expect(screen.getByRole('textbox', { name: '자기소개서 글자 수' })).toHaveValue('700');
    expect(screen.getByRole('textbox', { name: '자기소개서 내용' })).toHaveValue(
      '이서정입니다람쥐~'
    );
    expect(
      screen.getByText(
        (_, element) => element?.tagName === 'P' && element.textContent?.endsWith('/700자')
      )
    ).toBeInTheDocument();
  });

  it('자기소개서 문항을 접고 펼칠 수 있다', () => {
    render(<CoverLetterReviewForm />);

    const trigger = screen.getByRole('button', {
      name: '1번 자기소개서 문항 접기 또는 펼치기',
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
