import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { submitCoverLetter, type CoverLetterDetailResponse } from '@/entities/cover-letter';
import { CoverLetterCreateDraftProvider } from '@/features/cover-letter/create-flow';
import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterReviewForm } from './CoverLetterReviewForm';
import { CoverLetterPreferredQualificationForm } from '../preferred-qualification-form/CoverLetterPreferredQualificationForm';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ coverLetterId: 'cover-letter-id' }),
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('@/entities/cover-letter', () => ({
  ...jest.requireActual('@/entities/cover-letter'),
  submitCoverLetter: jest.fn(),
}));
jest.mock('@/shared/lib/toast', () => ({ appToast: { error: jest.fn() } }));

jest.mock('@/shared/assets/icons/common', () => ({
  AltArrowDownIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

const MOCK_DRAFT = {
  coverLetter: {
    id: 'cover-letter-id',
    title: '카카오 자기소개서',
    companyName: '카카오',
    positionTitle: '프론트엔드 개발자',
    jobPostingUrl: 'https://careers.kakao.com/jobs/frontend',
    preferences: '착하고 착하고 착한 사람 찾아요~!',
    displayStatus: 'WRITING',
  },
  reviewVersion: null,
  reviewJob: null,
  questions: [
    {
      questionResultId: null,
      questionId: 'question-id',
      order: 1,
      question: '이름이 무엇입니까?',
      maxAnswerLength: 700,
      originalAnswer: '이서정입니다람쥐~',
      originalAnswerLength: null,
      aiReport: null,
      rewrittenAnswer: null,
      rewrittenAnswerLength: null,
      finalAnswer: null,
      finalAnswerLength: null,
    },
  ],
} satisfies CoverLetterDetailResponse;

const renderReviewForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CoverLetterCreateDraftProvider draft={MOCK_DRAFT}>
        <CoverLetterReviewForm />
      </CoverLetterCreateDraftProvider>
    </QueryClientProvider>
  );

function ValidationFlowHarness() {
  const [isReview, setIsReview] = useState(true);
  useEffect(() => {
    mockReplace.mockImplementation(() => setIsReview(false));
  }, []);
  return (
    <CoverLetterCreateDraftProvider draft={MOCK_DRAFT}>
      {isReview ? <CoverLetterReviewForm /> : <CoverLetterPreferredQualificationForm />}
    </CoverLetterCreateDraftProvider>
  );
}

describe('CoverLetterReviewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockReset();
    jest
      .mocked(submitCoverLetter)
      .mockResolvedValue({ displayStatus: 'REVIEWING', jobId: 'job-id' });
  });
  it('이전 단계의 자기소개서 정보를 읽기 전용으로 표시한다', () => {
    renderReviewForm();

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
    renderReviewForm();

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
    renderReviewForm();

    const trigger = screen.getByRole('button', {
      name: '1번 자기소개서 문항 접기 또는 펼치기',
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('완료 시 확인 모달을 표시하고 확인 후에만 제출한다', async () => {
    renderReviewForm();
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('최종 제출하시겠습니까?');
    expect(submitCoverLetter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/writing/cover-letter-id'));
    expect(submitCoverLetter).toHaveBeenCalledTimes(1);
    expect(submitCoverLetter).toHaveBeenCalledWith('cover-letter-id');
  });

  it('취소하면 제출하지 않는다', async () => {
    renderReviewForm();
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    fireEvent.click(await screen.findByRole('button', { name: '취소' }));
    expect(submitCoverLetter).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('제출 검증 오류가 여러 단계에 있으면 첫 오류 단계로 이동한다', async () => {
    jest.mocked(submitCoverLetter).mockRejectedValue(
      new ApiError(400, {
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            { field: 'questions[0].originalAnswer', reason: '답변 오류' },
            { field: 'preferences', reason: '우대사항 오류' },
          ],
        },
      })
    );
    renderReviewForm();
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    fireEvent.click(await screen.findByRole('button', { name: '제출' }));
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/writing/create/cover-letter-id/step2')
    );
    expect(appToast.error).toHaveBeenCalledWith('입력 내용을 확인하고 다시 제출해 주세요.');
  });

  it('서버 장애 시 자동 재제출하거나 이동하지 않는다', async () => {
    jest.mocked(submitCoverLetter).mockRejectedValue(new ApiError(500));
    renderReviewForm();
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    fireEvent.click(await screen.findByRole('button', { name: '제출' }));
    await waitFor(() => expect(appToast.error).toHaveBeenCalled());
    expect(submitCoverLetter).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('제출 오류를 이전 단계 폼에 전달해 서버 메시지를 표시한다', async () => {
    jest.mocked(submitCoverLetter).mockRejectedValue(
      new ApiError(400, {
        error: {
          code: 'VALIDATION_ERROR',
          details: [{ field: 'preferences', reason: '우대사항은 3000자 이하로 입력해주세요.' }],
        },
      })
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ValidationFlowHarness />
      </QueryClientProvider>
    );
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    fireEvent.click(await screen.findByRole('button', { name: '제출' }));
    expect(await screen.findByText('우대사항은 3000자 이하로 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '공고 우대사항' })).toHaveValue(
      MOCK_DRAFT.coverLetter.preferences
    );
  });

  it('제출 중에는 확인·취소를 막고 API를 중복 호출하지 않는다', async () => {
    let resolveSubmit!: (value: { displayStatus: 'REVIEWING'; jobId: string }) => void;
    jest.mocked(submitCoverLetter).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );
    renderReviewForm();
    fireEvent.submit(screen.getByRole('form', { name: '자기소개서 최종 확인' }));
    const submitButton = await screen.findByRole('button', { name: '제출' });
    fireEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    fireEvent.click(submitButton);
    expect(submitCoverLetter).toHaveBeenCalledTimes(1);
    resolveSubmit({ displayStatus: 'REVIEWING', jobId: 'job-id' });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/writing/cover-letter-id'));
  });
});
