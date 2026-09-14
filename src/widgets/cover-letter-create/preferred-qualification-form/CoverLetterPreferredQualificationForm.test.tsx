import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ROUTES } from '@/shared/constants/routes';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterPreferredQualificationForm } from './CoverLetterPreferredQualificationForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CoverLetterPreferredQualificationForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('STEP2 우대사항 필드를 필수 입력으로 렌더링한다', () => {
    render(<CoverLetterPreferredQualificationForm />);

    const form = screen.getByRole('form', { name: '채용 공고 우대사항' });
    const preferredQualificationField = screen.getByRole('textbox', {
      name: '공고 우대사항',
    });

    expect(form).toHaveAttribute('id', COVER_LETTER_STEP_FORM_ID);
    expect(form).toHaveAttribute('novalidate');
    expect(preferredQualificationField).toBeRequired();
    expect(preferredQualificationField).toHaveAttribute('name', 'preferredQualification');
  });

  it('빈 폼을 제출하면 오류를 표시하고 이동하지 않는다', async () => {
    render(<CoverLetterPreferredQualificationForm />);

    fireEvent.submit(screen.getByRole('form', { name: '채용 공고 우대사항' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('공고 우대사항을 입력해주세요.');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('우대사항을 입력하고 제출하면 STEP3으로 이동한다', async () => {
    render(<CoverLetterPreferredQualificationForm />);

    fireEvent.change(screen.getByRole('textbox', { name: '공고 우대사항' }), {
      target: { value: 'React와 TypeScript 기반 서비스 개발 경험' },
    });
    fireEvent.submit(screen.getByRole('form', { name: '채용 공고 우대사항' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(3));
    });
  });
});
