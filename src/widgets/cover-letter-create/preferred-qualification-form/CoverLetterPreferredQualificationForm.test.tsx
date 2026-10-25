import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { saveCoverLetterPreferences } from '@/entities/cover-letter';
import { CoverLetterCreateDraftProvider } from '@/features/cover-letter/create-flow';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterPreferredQualificationForm } from './CoverLetterPreferredQualificationForm';

const mockPush = jest.fn();
const mockCoverLetterId = 'cover-letter-id';

jest.mock('next/navigation', () => ({
  useParams: () => ({ coverLetterId: mockCoverLetterId }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/entities/cover-letter', () => ({
  ...jest.requireActual('@/entities/cover-letter'),
  saveCoverLetterPreferences: jest.fn(),
}));
jest.mock('@/shared/lib/toast', () => ({ appToast: { success: jest.fn(), error: jest.fn() } }));

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CoverLetterCreateDraftProvider
        draft={{
          coverLetter: {
            id: mockCoverLetterId,
            displayStatus: 'WRITING',
            title: null,
            companyName: null,
            positionTitle: null,
            jobPostingUrl: null,
            preferences: null,
          },
          questions: [],
          reviewVersion: null,
          reviewJob: null,
        }}
      >
        <CoverLetterPreferredQualificationForm />
        <button form={COVER_LETTER_STEP_FORM_ID} type="submit" value="save-draft">
          임시 저장
        </button>
      </CoverLetterCreateDraftProvider>
    </QueryClientProvider>
  );

describe('CoverLetterPreferredQualificationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(saveCoverLetterPreferences).mockResolvedValue({ success: true });
  });

  it('STEP2 우대사항 필드를 필수 입력으로 렌더링한다', () => {
    renderForm();

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
    renderForm();

    fireEvent.submit(screen.getByRole('form', { name: '채용 공고 우대사항' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('공고 우대사항을 입력해주세요.');
    expect(mockPush).not.toHaveBeenCalled();
    expect(saveCoverLetterPreferences).not.toHaveBeenCalled();
  });

  it('우대사항을 입력하고 제출하면 STEP3으로 이동한다', async () => {
    renderForm();

    fireEvent.change(screen.getByRole('textbox', { name: '공고 우대사항' }), {
      target: { value: 'React와 TypeScript 기반 서비스 개발 경험' },
    });
    fireEvent.submit(screen.getByRole('form', { name: '채용 공고 우대사항' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.WRITING_CREATE_STEP(mockCoverLetterId, 3));
    });
    expect(saveCoverLetterPreferences).toHaveBeenCalledWith(mockCoverLetterId, {
      preferences: 'React와 TypeScript 기반 서비스 개발 경험',
    });
  });

  it('빈 우대사항도 임시 저장하고 현재 단계에 머문다', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }));
    await waitFor(() => expect(appToast.success).toHaveBeenCalledWith('임시 저장되었습니다.'));
    expect(saveCoverLetterPreferences).toHaveBeenCalledWith(mockCoverLetterId, {
      preferences: null,
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('저장 실패 시 입력을 유지하고 이동하지 않는다', async () => {
    jest.mocked(saveCoverLetterPreferences).mockRejectedValue(new Error('network'));
    renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: '공고 우대사항' }), {
      target: { value: 'React 경험' },
    });
    fireEvent.submit(screen.getByRole('form', { name: '채용 공고 우대사항' }));
    await waitFor(() => expect(appToast.error).toHaveBeenCalled());
    expect(screen.getByRole('textbox', { name: '공고 우대사항' })).toHaveValue('React 경험');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('preferences 서버 검증 오류를 우대사항 필드에 표시한다', async () => {
    jest.mocked(saveCoverLetterPreferences).mockRejectedValue(
      new ApiError(400, {
        error: {
          code: 'VALIDATION_ERROR',
          details: [{ field: 'preferences', reason: '최대 3000자까지 입력할 수 있습니다.' }],
        },
      })
    );
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '최대 3000자까지 입력할 수 있습니다.'
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
