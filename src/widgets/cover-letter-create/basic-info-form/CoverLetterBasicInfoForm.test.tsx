import { fireEvent, render, screen } from '@testing-library/react';

import { ROUTES } from '@/shared/constants/routes';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterBasicInfoForm } from './CoverLetterBasicInfoForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CoverLetterBasicInfoForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('STEP1 기본 정보 필드를 올바른 제약과 함께 렌더링한다', () => {
    render(<CoverLetterBasicInfoForm />);

    const form = screen.getByRole('form', { name: '자기소개서 기본 정보' });
    const titleInput = screen.getByRole('textbox', { name: '자기소개서 제목' });
    const companyNameInput = screen.getByRole('textbox', { name: '회사명' });
    const positionTitleInput = screen.getByRole('textbox', { name: '희망 직무' });
    const jobPostingUrlInput = screen.getByRole('textbox', { name: '직무 공고 사이트 링크' });

    expect(titleInput).toBeRequired();
    expect(titleInput).toHaveAttribute('maxlength', '50');
    expect(titleInput).toHaveAttribute('name', 'title');

    expect(companyNameInput).toBeRequired();
    expect(companyNameInput).toHaveAttribute('maxlength', '30');
    expect(companyNameInput).toHaveAttribute('name', 'companyName');

    expect(positionTitleInput).toBeRequired();
    expect(positionTitleInput).toHaveAttribute('maxlength', '30');
    expect(positionTitleInput).toHaveAttribute('name', 'positionTitle');

    expect(jobPostingUrlInput).not.toBeRequired();
    expect(jobPostingUrlInput).toHaveAttribute('maxlength', '500');
    expect(jobPostingUrlInput).toHaveAttribute('name', 'jobPostingUrl');
    expect(jobPostingUrlInput).toHaveAttribute('type', 'url');
    expect(form).toHaveAttribute('id', COVER_LETTER_STEP_FORM_ID);
    expect(form).toHaveAttribute('novalidate');
  });

  it('폼 제출 시 다음 STEP으로 이동한다', () => {
    render(<CoverLetterBasicInfoForm />);

    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 기본 정보' }));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(2));
  });
});
