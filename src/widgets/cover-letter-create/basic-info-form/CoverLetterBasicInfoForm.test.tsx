import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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

  it('빈 폼을 제출하면 필수 입력 오류를 표시하고 이동하지 않는다', async () => {
    render(<CoverLetterBasicInfoForm />);

    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 기본 정보' }));

    expect(await screen.findByText('자기소개서 제목을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('회사명을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('희망 직무를 입력해주세요.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('필수 정보를 입력하면 다음 STEP으로 이동한다', async () => {
    render(<CoverLetterBasicInfoForm />);

    fireEvent.change(screen.getByRole('textbox', { name: '자기소개서 제목' }), {
      target: { value: '카카오 자기소개서' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '회사명' }), {
      target: { value: '카카오' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '희망 직무' }), {
      target: { value: '프론트엔드 개발자' },
    });
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 기본 정보' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(2));
    });
  });
});
