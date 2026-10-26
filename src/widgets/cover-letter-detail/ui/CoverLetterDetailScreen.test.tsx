import type { ComponentPropsWithoutRef } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  coverLetterQueryKeys,
  getCoverLetterDetail,
  type CoverLetterDetailResponse,
} from '@/entities/cover-letter';
import { getReviewVersionDetail } from '@/entities/review-version';
import { ReviewVersionProvider } from '@/features/review-version/version-management';
import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';

import { CoverLetterDetailScreen } from './CoverLetterDetailScreen';
import { useCoverLetterReviewJob } from '../hooks/useCoverLetterReviewJob';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams('jobId=returned-job'),
  redirect: jest.fn(),
}));
jest.mock('@/entities/cover-letter/api/api', () => ({ getCoverLetterDetail: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ appToast: { error: jest.fn() } }));
jest.mock('../hooks/useCoverLetterReviewJob', () => ({ useCoverLetterReviewJob: jest.fn() }));
jest.mock('@/entities/review-version/api/api', () => ({ getReviewVersionDetail: jest.fn() }));
jest.mock('@/shared/ui/lottie-animation', () => ({ LottieAnimation: () => null }));
jest.mock('@/shared/assets/icons/common', () => ({
  AltArrowDownIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

const DETAIL: CoverLetterDetailResponse = {
  coverLetter: {
    id: 'letter-id',
    title: '서버 자기소개서',
    companyName: '회사',
    positionTitle: '개발자',
    jobPostingUrl: null,
    preferences: 'React 경험',
    displayStatus: 'REVIEWED',
  },
  reviewVersion: {
    id: 'version-id',
    version: 'V.0.1',
    status: 'COMPLETED',
    isLatest: true,
    isLatestReviewed: true,
    requestInstruction: null,
    createdAt: '2026-10-13T00:00:00Z',
  },
  reviewJob: null,
  questions: [
    {
      questionId: 'q1',
      questionResultId: 'result1',
      order: 1,
      question: '서버 질문',
      originalAnswer: '서버 원문',
      originalAnswerLength: 5,
      maxAnswerLength: null,
      aiReport: '서버 분석',
      rewrittenAnswer: '서버 첨삭',
      rewrittenAnswerLength: 5,
      finalAnswer: '서버 최종본',
      finalAnswerLength: 6,
    },
  ],
};

const renderDetail = (detail: CoverLetterDetailResponse, selectedVersionId = 'version-id') => {
  const client = new QueryClient();
  client.setQueryData(coverLetterQueryKeys.detail('letter-id'), detail);
  return render(
    <QueryClientProvider client={client}>
      <ReviewVersionProvider
        versions={[]}
        selectedVersionId={selectedVersionId}
        onSelectedVersionChange={jest.fn()}
      >
        <CoverLetterDetailScreen coverLetterId="letter-id" />
      </ReviewVersionProvider>
    </QueryClientProvider>
  );
};

describe('CoverLetterDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCoverLetterDetail).mockResolvedValue(DETAIL);
    jest.mocked(useCoverLetterReviewJob).mockReturnValue({
      jobState: undefined,
      questionResults: [],
      connectionIssue: undefined,
      hasCompletedReview: false,
      retry: jest.fn(),
    });
  });

  it('완료된 자기소개서의 실제 서버 결과를 읽기 전용으로 표시한다', () => {
    renderDetail(DETAIL);
    expect(screen.getByText('서버 자기소개서')).toBeInTheDocument();
    expect(screen.getByText('서버 질문')).toBeInTheDocument();
    expect(screen.getByText('서버 분석')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '최종 작성본' })).toHaveValue('서버 최종본');
    expect(screen.getByRole('textbox', { name: '최종 작성본' })).toHaveAttribute('readonly');
    expect(useCoverLetterReviewJob).toHaveBeenCalledWith('letter-id', undefined);
  });

  it('첨삭 중이면 서버 Job ID로 구독하고 진행률을 표시한다', () => {
    renderDetail({
      ...DETAIL,
      coverLetter: { ...DETAIL.coverLetter, displayStatus: 'REVIEWING' },
      reviewJob: {
        id: 'server-job',
        status: 'PROCESSING',
        progress: { current: 1, total: 2, message: '두 번째 문항 첨삭 중' },
        error: null,
      },
    });
    expect(useCoverLetterReviewJob).toHaveBeenCalledWith('letter-id', 'server-job');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
    expect(screen.getByRole('status')).toHaveTextContent('두 번째 문항 첨삭 중');
    expect(screen.queryByRole('textbox', { name: '최종 작성본' })).not.toBeInTheDocument();
  });

  it('첨삭 실패 시 서버 내부 오류 대신 사용자 안내 문구를 표시한다', () => {
    renderDetail({
      ...DETAIL,
      coverLetter: { ...DETAIL.coverLetter, displayStatus: 'REVIEW_FAILED' },
      reviewJob: {
        id: 'job',
        status: 'FAILED',
        progress: { current: 0, total: 2, message: '' },
        error: { code: 'LLM_PROVIDER_ERROR', message: 'AI 서비스 응답이 없습니다.' },
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'AI 첨삭을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.'
    );
    expect(
      screen.getByRole('button', { name: '실패한 문항 결과 다시 불러오기' })
    ).toBeInTheDocument();
  });

  it('선택한 이전 버전을 API로 조회해서 표시한다', async () => {
    jest.mocked(getReviewVersionDetail).mockResolvedValue({
      ...DETAIL,
      coverLetter: { ...DETAIL.coverLetter, title: '이전 버전 제목' },
    });
    renderDetail(DETAIL, 'older-version');
    expect(await screen.findByText('이전 버전 제목')).toBeInTheDocument();
    expect(getReviewVersionDetail).toHaveBeenCalledWith(
      'letter-id',
      'older-version',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('상태 새로고침의 403 오류는 토스트로 안내하고 기존 화면을 유지한다', async () => {
    jest.mocked(getCoverLetterDetail).mockRejectedValue(new ApiError(403));
    renderDetail({
      ...DETAIL,
      coverLetter: { ...DETAIL.coverLetter, displayStatus: 'REVIEW_FAILED' },
      reviewJob: {
        id: 'job',
        status: 'FAILED',
        progress: { current: 0, total: 2, message: '' },
        error: { code: 'LLM_PROVIDER_ERROR', message: '기존 실패 사유' },
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '실패한 문항 결과 다시 불러오기' }));
    await waitFor(() =>
      expect(appToast.error).toHaveBeenCalledWith(
        '자기소개서 상태를 새로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      )
    );
    expect(screen.getByText('서버 자기소개서')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('기존 실패 사유');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('상태 새로고침의 404 오류는 토스트 안내 후 목록으로 이동한다', async () => {
    jest.mocked(getCoverLetterDetail).mockRejectedValue(new ApiError(404));
    jest.mocked(useCoverLetterReviewJob).mockReturnValue({
      jobState: undefined,
      questionResults: [],
      connectionIssue: '연결 끊김',
      hasCompletedReview: false,
      retry: jest.fn(),
    });
    renderDetail({ ...DETAIL, coverLetter: { ...DETAIL.coverLetter, displayStatus: 'REVIEWING' } });
    fireEvent.click(screen.getByRole('button', { name: '진행 상황 다시 확인' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/writing'));
    expect(appToast.error).toHaveBeenCalledWith('자기소개서가 없거나 접근할 수 없습니다.');
  });
});
