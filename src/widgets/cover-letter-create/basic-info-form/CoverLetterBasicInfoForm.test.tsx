import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { saveCoverLetterBasicInfo } from '@/entities/cover-letter';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterBasicInfoForm } from './CoverLetterBasicInfoForm';

const mockPush = jest.fn();
const mockCoverLetterId = 'cover-letter-id';

jest.mock('next/navigation', () => ({
  useParams: () => ({ coverLetterId: mockCoverLetterId }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/entities/cover-letter', () => ({
  ...jest.requireActual('@/entities/cover-letter'),
  saveCoverLetterBasicInfo: jest.fn(),
}));
jest.mock('@/shared/lib/toast', () => ({ appToast: { success: jest.fn(), error: jest.fn() } }));

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CoverLetterBasicInfoForm />
      <button form={COVER_LETTER_STEP_FORM_ID} type="submit" value="save-draft">
        임시 저장
      </button>
    </QueryClientProvider>
  );

describe('CoverLetterBasicInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(saveCoverLetterBasicInfo).mockResolvedValue({ success: true });
  });

  it('STEP1 기본 정보 필드를 올바른 제약과 함께 렌더링한다', () => {
    renderForm();

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
    renderForm();

    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 기본 정보' }));

    expect(await screen.findByText('자기소개서 제목을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('회사명을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('희망 직무를 입력해주세요.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(saveCoverLetterBasicInfo).not.toHaveBeenCalled();
  });

  it('필수 정보를 입력하면 다음 STEP으로 이동한다', async () => {
    renderForm();

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
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(mockCoverLetterId, 2));
    });
    expect(saveCoverLetterBasicInfo).toHaveBeenCalledWith(mockCoverLetterId, {
      title: '카카오 자기소개서',
      companyName: '카카오',
      positionTitle: '프론트엔드 개발자',
      jobPostingUrl: null,
    });
  });

  it('미완성 입력을 임시 저장하면 필수값 오류 없이 저장하고 현재 단계에 머문다', async () => {
    renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: '자기소개서 제목' }), {
      target: { value: ' 초안 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }));
    await waitFor(() => expect(appToast.success).toHaveBeenCalled());
    expect(saveCoverLetterBasicInfo).toHaveBeenCalledWith(mockCoverLetterId, {
      title: '초안',
      companyName: null,
      positionTitle: null,
      jobPostingUrl: null,
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByText('회사명을 입력해주세요.')).not.toBeInTheDocument();
  });

  it('저장이 실패하면 입력값을 유지하고 이동하지 않는다', async () => {
    jest.mocked(saveCoverLetterBasicInfo).mockRejectedValue(new Error('network'));
    renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: '자기소개서 제목' }), {
      target: { value: '초안' },
    });
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }));
    await waitFor(() => expect(appToast.error).toHaveBeenCalled());
    expect(screen.getByRole('textbox', { name: '자기소개서 제목' })).toHaveValue('초안');
    expect(mockPush).not.toHaveBeenCalled();
    expect(appToast.error).toHaveBeenCalledWith(
      '기본 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
    );
  });

  it('서버 검증 오류를 해당 필드에 표시하고 입력값을 유지한다', async () => {
    jest.mocked(saveCoverLetterBasicInfo).mockRejectedValue(
      new ApiError(400, {
        error: {
          code: 'VALIDATION_ERROR',
          details: [{ field: 'jobPostingUrl', reason: '공고 링크 형식을 확인해주세요.' }],
        },
      })
    );
    renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: '직무 공고 사이트 링크' }), {
      target: { value: '잘못된 링크' },
    });
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }));
    expect(await screen.findByText('공고 링크 형식을 확인해주세요.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '직무 공고 사이트 링크' })).toHaveValue(
      '잘못된 링크'
    );
    expect(mockPush).not.toHaveBeenCalled();
    expect(appToast.error).toHaveBeenCalledWith('입력 내용을 확인하고 다시 저장해 주세요.');
  });
});
