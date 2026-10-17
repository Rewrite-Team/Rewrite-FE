import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  coverLetterQueryKeys,
  getCoverLetterDetail,
  type CoverLetterDetailResponse,
} from '@/entities/cover-letter';
import { connectLlmJobEvents, getLlmJobStatus, type LlmJobStateResponse } from '@/entities/llm-job';
import { ApiError } from '@/shared/api';

import { useCoverLetterReviewJob } from './useCoverLetterReviewJob';

jest.mock('@/entities/cover-letter/api/api', () => ({ getCoverLetterDetail: jest.fn() }));
jest.mock('@/entities/llm-job', () => ({
  ...jest.requireActual('@/entities/llm-job'),
  connectLlmJobEvents: jest.fn(),
  getLlmJobStatus: jest.fn(),
}));
jest.mock('@/entities/user', () => ({ refreshAuthTokens: jest.fn() }));

const DETAIL: CoverLetterDetailResponse = {
  coverLetter: {
    id: 'letter-id',
    title: '실제 자기소개서',
    companyName: null,
    positionTitle: null,
    jobPostingUrl: null,
    preferences: null,
    displayStatus: 'REVIEWED',
  },
  questions: [],
  reviewVersion: null,
  reviewJob: null,
};

const state = (status: 'PROCESSING' | 'COMPLETED' | 'FAILED'): LlmJobStateResponse => ({
  status,
  progress: { current: 1, total: 2, message: '첨삭 중' },
  resultRef: null,
  error: status === 'FAILED' ? { code: 'LLM_PROVIDER_ERROR', message: 'AI 처리 실패' } : null,
});

let finishStream: () => void;
let queryClient: QueryClient;
const setup = () =>
  renderHook(() => useCoverLetterReviewJob('letter-id', 'job-id'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

describe('useCoverLetterReviewJob', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    queryClient = new QueryClient();
    jest.mocked(getCoverLetterDetail).mockResolvedValue(DETAIL);
    jest.mocked(getLlmJobStatus).mockResolvedValue(state('COMPLETED'));
    jest.mocked(connectLlmJobEvents).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishStream = resolve;
        })
    );
  });
  afterEach(() => queryClient.clear());

  it('진행 상태를 갱신하고 종료 이벤트 이후의 문항 결과까지 받은 뒤 결과를 조회한다', async () => {
    const { result, unmount } = setup();
    await waitFor(() => expect(connectLlmJobEvents).toHaveBeenCalledTimes(1));
    const options = jest.mocked(connectLlmJobEvents).mock.calls[0][1];
    act(() =>
      options.onmessage({ id: '1', event: 'job.state', data: JSON.stringify(state('PROCESSING')) })
    );
    await waitFor(() => expect(result.current.jobState?.progress.current).toBe(1));
    act(() =>
      options.onmessage({ id: '2', event: 'job.state', data: JSON.stringify(state('COMPLETED')) })
    );
    expect(getCoverLetterDetail).not.toHaveBeenCalled();
    expect(options.signal.aborted).toBe(false);
    act(() =>
      options.onmessage({
        id: '3',
        event: 'review.questions',
        data: JSON.stringify({
          items: [{ questionId: 'q1', order: 1, rewrittenAnswer: '실제 첨삭 결과' }],
        }),
      })
    );
    expect(result.current.questionResults[0].rewrittenAnswer).toBe('실제 첨삭 결과');
    await act(async () => finishStream());
    await waitFor(() =>
      expect(queryClient.getQueryData(coverLetterQueryKeys.detail('letter-id'))).toEqual(DETAIL)
    );
    unmount();
    expect(options.signal.aborted).toBe(true);
  });

  it('3회 연결 장애 시 HTTP로 실패 상태를 복구하고 SSE를 종료한다', async () => {
    jest.mocked(getLlmJobStatus).mockResolvedValue(state('FAILED'));
    jest.mocked(getCoverLetterDetail).mockResolvedValue({
      ...DETAIL,
      coverLetter: { ...DETAIL.coverLetter, displayStatus: 'REVIEW_FAILED' },
    });
    const { result } = setup();
    await waitFor(() => expect(connectLlmJobEvents).toHaveBeenCalled());
    const options = jest.mocked(connectLlmJobEvents).mock.calls[0][1];
    act(() => {
      options.onRetry?.();
      options.onRetry?.();
      options.onRetry?.();
    });
    await waitFor(() => expect(options.signal.aborted).toBe(true));
    expect(getLlmJobStatus).toHaveBeenCalledTimes(1);
    expect(result.current.jobState?.status).toBe('FAILED');
  });

  it('Job 조회가 불가능해도 도메인 재조회로 이미 완료된 결과를 복구한다', async () => {
    jest.mocked(connectLlmJobEvents).mockRejectedValue(new Error('stream 404'));
    jest.mocked(getLlmJobStatus).mockRejectedValue(new ApiError(404));
    const { result } = setup();
    await waitFor(() =>
      expect(queryClient.getQueryData(coverLetterQueryKeys.detail('letter-id'))).toEqual(DETAIL)
    );
    expect(result.current.connectionIssue).toBeUndefined();
  });

  it('종료 상태 없이 연결이 끝나면 수동 복구 안내를 표시한다', async () => {
    jest.mocked(getLlmJobStatus).mockResolvedValue(state('PROCESSING'));
    const { result } = setup();
    await waitFor(() => expect(connectLlmJobEvents).toHaveBeenCalled());
    await act(async () => finishStream());
    await waitFor(() => expect(result.current.connectionIssue).toContain('연결이 종료'));
  });
});
