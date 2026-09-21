import type { ComponentPropsWithoutRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { FinalDraftSection } from './FinalDraftSection';

jest.mock('@/shared/assets/icons/common', () => ({
  EditIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

describe('FinalDraftSection', () => {
  it('편집한 최종 작성본을 화면에 저장한다', () => {
    render(
      <FinalDraftSection characterLimit={700} initialValue="기존 작성본" questionId="question-1" />
    );

    fireEvent.click(screen.getByRole('button', { name: '최종 작성본 편집' }));
    fireEvent.change(screen.getByRole('textbox', { name: '최종 작성본' }), {
      target: { value: '새로운 최종 작성본입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.queryByRole('textbox', { name: '최종 작성본' })).not.toBeInTheDocument();
    expect(screen.getByText('새로운 최종 작성본입니다.')).toBeInTheDocument();
  });
});
