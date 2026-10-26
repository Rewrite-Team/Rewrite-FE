import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { connectCoverLetterReviewStatuses, listCoverLetters } from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';
import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';

import { CoverLetterList } from './CoverLetterList';

jest.mock('@/entities/cover-letter/api/api', () => ({
  listCoverLetters: jest.fn(),
}));

jest.mock('@/entities/cover-letter/api/stream', () => ({
  connectCoverLetterReviewStatuses: jest.fn(),
}));

jest.mock('@/shared/assets/icons/common', () => ({
  ChevronLeftIcon: 'svg',
  ChevronRightIcon: 'svg',
}));

jest.mock('@/shared/assets/icons/side-menu', () => ({ DeleteIcon: 'svg' }));

jest.mock('@/shared/ui/lottie-animation', () => ({
  LottieAnimation: () => null,
}));

jest.mock('@/shared/lib/toast', () => ({
  appToast: { error: jest.fn() },
}));

const mockListCoverLetters = jest.mocked(listCoverLetters);
const mockConnectReviewStatuses = jest.mocked(connectCoverLetterReviewStatuses);
const mockRouter = { replace: jest.fn() };

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const createResponse = (page: number): CoverLetterListResponse => ({
  items: [
    {
      id: `cover-letter-${page}`,
      title: `${page}페이지 자기소개서`,
      companyName: null,
      positionTitle: null,
      displayStatus: 'WRITING',
      createdAt: '2026-10-12T12:00:00',
      latestReviewedVersionId: null,
    },
  ],
  page,
  size: 6,
  totalItems: 7,
  totalPages: 2,
});

let queryClient: QueryClient;

const renderList = (requestedPage = 1) =>
  render(
    <QueryClientProvider client={queryClient}>
      <CoverLetterList requestedPage={requestedPage} />
    </QueryClientProvider>
  );

describe('CoverLetterList', () => {
  beforeEach(() => {
    mockListCoverLetters.mockReset();
    mockConnectReviewStatuses.mockReset();
    mockConnectReviewStatuses.mockImplementation(() => new Promise(() => {}));
    mockRouter.replace.mockClear();
    jest.mocked(appToast.error).mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60 * 1000 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  it('캐시 없는 페이지 이동 시 이전 카드 대신 스켈레톤을 표시하고 페이지별 API를 조회한다', async () => {
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    mockListCoverLetters.mockImplementationOnce(() => new Promise(() => {}));
    const { container, rerender, unmount } = renderList();

    expect(screen.getByRole('status')).toHaveTextContent('목록을 불러오는 중');
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);

    expect(
      await screen.findByRole('link', { name: /1페이지 자기소개서.*이어서 작성/ })
    ).toHaveAttribute('href', '/writing/create/cover-letter-1/step1');
    expect(screen.getByText('회사 미입력')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2페이지' })).toHaveAttribute(
      'href',
      '/writing?page=2'
    );

    rerender(
      <QueryClientProvider client={queryClient}>
        <CoverLetterList requestedPage={2} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('1페이지 자기소개서')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockListCoverLetters).toHaveBeenNthCalledWith(
        2,
        { page: 2, size: 6 },
        { signal: expect.any(AbortSignal) }
      );
    });
    expect(mockConnectReviewStatuses).toHaveBeenCalledTimes(1);
    const { signal } = mockConnectReviewStatuses.mock.calls[0][0];
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it.each(['mouseEnter', 'focus'] as const)(
    '%s 시 이동할 페이지를 미리 조회하고 캐시에서 바로 표시한다',
    async (event) => {
      mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
      mockListCoverLetters.mockResolvedValueOnce(createResponse(2));
      const { rerender } = renderList();
      await screen.findByText('1페이지 자기소개서');

      const target = screen.getByRole('link', { name: '2페이지' });
      fireEvent[event](target);

      await waitFor(() => {
        expect(queryClient.getQueryData(['cover-letters', 'list', { page: 2, size: 6 }])).toEqual(
          createResponse(2)
        );
      });
      fireEvent.mouseEnter(target);
      fireEvent.focus(target);
      fireEvent.mouseEnter(screen.getByRole('link', { name: '1페이지' }));
      expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
      expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
      expect(mockRouter.replace).not.toHaveBeenCalled();

      rerender(
        <QueryClientProvider client={queryClient}>
          <CoverLetterList requestedPage={2} />
        </QueryClientProvider>
      );

      expect(screen.getByText('2페이지 자기소개서')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
    }
  );

  it.each([
    [1, '다음 페이지', 2],
    [2, '이전 페이지', 1],
  ] as const)(
    '%s페이지의 %s 화살표에서도 데이터를 미리 조회한다',
    async (page, label, targetPage) => {
      mockListCoverLetters.mockResolvedValueOnce(createResponse(page));
      mockListCoverLetters.mockResolvedValueOnce(createResponse(targetPage));
      renderList(page);
      await screen.findByText(`${page}페이지 자기소개서`);

      fireEvent.focus(screen.getByRole('link', { name: label }));

      await waitFor(() => {
        expect(mockListCoverLetters).toHaveBeenNthCalledWith(
          2,
          { page: targetPage, size: 6 },
          { signal: expect.any(AbortSignal) }
        );
      });
    }
  );

  it('프리패칭 실패는 현재 목록에 오류를 표시하지 않고 실제 페이지 이동 시 다시 조회한다', async () => {
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    mockListCoverLetters.mockRejectedValueOnce(new Error('프리패칭 실패'));
    mockListCoverLetters.mockResolvedValueOnce(createResponse(2));
    const { rerender } = renderList();
    await screen.findByText('1페이지 자기소개서');

    fireEvent.mouseEnter(screen.getByRole('link', { name: '2페이지' }));
    await waitFor(() => {
      expect(
        queryClient.getQueryState(['cover-letters', 'list', { page: 2, size: 6 }])?.status
      ).toBe('error');
    });
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(appToast.error).not.toHaveBeenCalled();

    rerender(
      <QueryClientProvider client={queryClient}>
        <CoverLetterList requestedPage={2} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('2페이지 자기소개서')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(3);
  });

  it('성공 응답의 목록이 비었을 때 빈 상태를 표시한다', async () => {
    mockListCoverLetters.mockResolvedValue({
      items: [],
      page: 1,
      size: 6,
      totalItems: 0,
      totalPages: 0,
    });

    renderList();

    expect(await screen.findByText('아직 작성한 자기소개서가 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '페이지 이동' })).not.toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('최초 오류 화면에서 수동 재시도도 실패하면 토스트를 표시한다', async () => {
    mockListCoverLetters.mockRejectedValue(new ApiError(403));
    renderList();
    await screen.findByRole('alert');
    expect(appToast.error).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() =>
      expect(appToast.error).toHaveBeenCalledWith(
        '목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      )
    );
    expect(screen.getByRole('alert')).toHaveTextContent('자기소개서를 불러오지 못했어요');
  });

  it('최초 요청 실패를 빈 목록과 구분하고 재시도로 목록을 복구한다', async () => {
    mockListCoverLetters.mockRejectedValueOnce(new Error('조회 실패'));
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));

    renderList();

    expect(await screen.findByRole('alert')).toHaveTextContent('자기소개서를 불러오지 못했어요');
    expect(appToast.error).not.toHaveBeenCalled();
    expect(screen.queryByText('아직 작성한 자기소개서가 없어요')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });

  it('전체 페이지를 넘은 요청은 마지막 페이지로 복구하고 정상 빈 목록 안내를 표시하지 않는다', async () => {
    mockListCoverLetters.mockResolvedValueOnce({ ...createResponse(10), items: [] });
    mockListCoverLetters.mockResolvedValueOnce(createResponse(2));
    const { rerender } = renderList(10);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/writing?page=2', { scroll: false });
    });
    expect(screen.queryByText('아직 작성한 자기소개서가 없어요')).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <CoverLetterList requestedPage={2} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('2페이지 자기소개서')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2페이지' })).toHaveAttribute('aria-current', 'page');
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
  });

  it('목록이 없는 상태에서 1보다 큰 페이지를 요청하면 1페이지로 복구한다', async () => {
    mockListCoverLetters.mockResolvedValue({
      items: [],
      page: 3,
      size: 6,
      totalItems: 0,
      totalPages: 0,
    });

    renderList(3);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/writing?page=1', { scroll: false });
    });
    expect(screen.queryByText('아직 작성한 자기소개서가 없어요')).not.toBeInTheDocument();
  });

  it('재조회 실패는 기존 카드를 유지하고 토스트로 한 번 알린다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockRejectedValueOnce(new Error('재조회 실패'));
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    const { rerender } = renderList();
    void queryClient.invalidateQueries({ queryKey: ['cover-letters', 'list'] });

    await waitFor(() => {
      expect(appToast.error).toHaveBeenCalledWith(
        '목록을 새로 불러오지 못했어요. 이전 조회 결과를 표시합니다.'
      );
    });
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(
      <QueryClientProvider client={queryClient}>
        <CoverLetterList requestedPage={1} />
      </QueryClientProvider>
    );
    expect(appToast.error).toHaveBeenCalledTimes(1);

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['cover-letters', 'list'] });
    });
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['cover-letter.review-status.snapshot', 'REVIEWED', '첨삭 완료'],
    ['cover-letter.review-status.changed', 'REVIEW_FAILED', '첨삭 실패'],
  ] as const)(
    '%s 이벤트를 받으면 카드 상태를 갱신하고 다른 페이지 캐시도 무효화한다',
    async (event, displayStatus, label) => {
      const response = createResponse(1);
      mockListCoverLetters.mockResolvedValueOnce(response);
      mockListCoverLetters.mockResolvedValueOnce({
        ...response,
        items: response.items.map((item) => ({
          ...item,
          displayStatus,
          latestReviewedVersionId: displayStatus === 'REVIEWED' ? 'review-version-1' : null,
        })),
      });
      const otherPageKey = ['cover-letters', 'list', { page: 2, size: 6 }];
      queryClient.setQueryData(otherPageKey, createResponse(2));
      renderList();
      expect(await screen.findByText('작성 중')).toBeInTheDocument();

      act(() => {
        mockConnectReviewStatuses.mock.calls[0][0].onmessage({
          event,
          data: '{}',
          id: '',
        });
      });

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
      expect(queryClient.getQueryState(otherPageKey)?.isInvalidated).toBe(true);
      expect(mockConnectReviewStatuses).toHaveBeenCalledTimes(1);
    }
  );

  it('스냅샷이 프리패칭 캐시와 같으면 재조회하지 않고 상태가 달라지면 재조회한다', async () => {
    const response = { ...createResponse(1), totalItems: 1, totalPages: 1 };
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], response);
    mockListCoverLetters.mockResolvedValue({
      ...response,
      items: response.items.map((item) => ({
        ...item,
        displayStatus: 'REVIEWED',
        latestReviewedVersionId: 'review-1',
      })),
    });
    renderList();
    const { onmessage } = mockConnectReviewStatuses.mock.calls[0][0];
    const snapshot = {
      items: [
        {
          coverLetterId: 'cover-letter-1',
          displayStatus: 'WRITING',
          latestReviewedVersionId: null,
        },
      ],
    };

    act(() =>
      onmessage({
        event: 'cover-letter.review-status.snapshot',
        data: JSON.stringify(snapshot),
        id: '',
      })
    );
    expect(mockListCoverLetters).not.toHaveBeenCalled();

    act(() =>
      onmessage({
        event: 'cover-letter.review-status.snapshot',
        data: JSON.stringify({
          items: [
            {
              ...snapshot.items[0],
              displayStatus: 'REVIEWED',
              latestReviewedVersionId: 'review-1',
            },
          ],
        }),
        id: '',
      })
    );
    expect(await screen.findByText('첨삭 완료')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
  });

  it('최초 목록 조회 중 SSE 변경이 오면 이전 요청을 취소하고 최신 상태를 다시 조회한다', async () => {
    let resolveInitial: (data: CoverLetterListResponse) => void = () => {};
    mockListCoverLetters.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveInitial = resolve;
        })
    );
    const response = createResponse(1);
    mockListCoverLetters.mockResolvedValueOnce({
      ...response,
      items: response.items.map((item) => ({
        ...item,
        displayStatus: 'REVIEWED',
        latestReviewedVersionId: 'review-1',
      })),
    });
    renderList();
    await waitFor(() => expect(mockListCoverLetters).toHaveBeenCalledTimes(1));
    const initialSignal = mockListCoverLetters.mock.calls[0][1]?.signal;

    act(() =>
      mockConnectReviewStatuses.mock.calls[0][0].onmessage({
        event: 'cover-letter.review-status.changed',
        data: '{}',
        id: '',
      })
    );
    expect(await screen.findByText('첨삭 완료')).toBeInTheDocument();
    expect(initialSignal?.aborted).toBe(true);
    await act(async () => resolveInitial(response));
    expect(screen.queryByText('작성 중')).not.toBeInTheDocument();
    expect(screen.getByText('첨삭 완료')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });

  it('heartbeat나 알 수 없는 이벤트로 목록을 재조회하지 않는다', async () => {
    mockListCoverLetters.mockResolvedValue(createResponse(1));
    renderList();
    await screen.findByText('작성 중');

    act(() => {
      const { onmessage } = mockConnectReviewStatuses.mock.calls[0][0];
      onmessage({ event: 'heartbeat', data: '', id: '' });
      onmessage({ event: 'unknown', data: 'invalid json', id: '' });
    });

    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
  });

  it('SSE 재연결마다 HTTP 목록 조회가 끝날 때까지 기다린다', async () => {
    mockListCoverLetters.mockResolvedValue(createResponse(1));
    renderList();
    await screen.findByText('작성 중');
    const { onRetry } = mockConnectReviewStatuses.mock.calls[0][0];

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await act(async () => {
        await onRetry?.();
      });
      expect(mockListCoverLetters).toHaveBeenCalledTimes(1 + attempt);
    }
  });

  it('복구 목록 조회가 멈추면 요청을 취소해 재연결 대기를 끝내고 다음 조회를 허용한다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockImplementationOnce(() => new Promise(() => {}));
    renderList();
    jest.useFakeTimers();
    const { onRetry } = mockConnectReviewStatuses.mock.calls[0][0];
    let recovery: void | Promise<void>;
    await act(async () => {
      recovery = onRetry?.();
      await jest.advanceTimersByTimeAsync(0);
    });
    const requestSignal = mockListCoverLetters.mock.calls[0][1]?.signal;
    expect(requestSignal?.aborted).toBe(false);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(15_000);
      await recovery;
    });
    expect(requestSignal?.aborted).toBe(true);
    expect(queryClient.isFetching()).toBe(0);
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();

    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    await act(async () => {
      await onRetry?.();
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });

  it('화면을 떠난 뒤 지연된 이벤트로 캐시를 갱신하지 않는다', async () => {
    mockListCoverLetters.mockResolvedValue(createResponse(1));
    const { unmount } = renderList();
    await screen.findByText('작성 중');
    const { onmessage, signal } = mockConnectReviewStatuses.mock.calls[0][0];
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    unmount();

    onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });

    expect(signal.aborted).toBe(true);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('스트림 연결이 중단되면 일반 목록 조회로 복구한다', async () => {
    let rejectStream: (error: Error) => void = () => {};
    mockConnectReviewStatuses.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectStream = reject;
        })
    );
    mockListCoverLetters.mockResolvedValue(createResponse(1));
    renderList();
    await screen.findByText('작성 중');

    await act(async () => rejectStream(new Error('연결 중단')));

    await waitFor(() => expect(mockListCoverLetters).toHaveBeenCalledTimes(2));
  });

  it('SSE 갱신의 일시 오류는 3초 후 한 번 재시도하고 대기 중 이벤트를 합친다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockRejectedValueOnce(new TypeError('네트워크 단절'));
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    renderList();
    jest.useFakeTimers();
    const { onmessage } = mockConnectReviewStatuses.mock.calls[0][0];
    await act(async () => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
    expect(appToast.error).not.toHaveBeenCalled();
    act(() => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2999);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
    expect(appToast.error).not.toHaveBeenCalled();
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
  });

  it('SSE 갱신의 최종 실패에만 토스트를 표시하고 추가로 반복 재시도하지 않는다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockRejectedValue(new ApiError(503));
    renderList();
    jest.useFakeTimers();
    await act(async () => {
      mockConnectReviewStatuses.mock.calls[0][0].onmessage({
        event: 'cover-letter.review-status.changed',
        data: '{}',
        id: '',
      });
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(appToast.error).not.toHaveBeenCalled();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });
    expect(appToast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10_000);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });

  it('SSE 갱신의 403은 재시도하지 않고 화면 이탈 시 일시 오류의 대기도 취소한다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockRejectedValueOnce(new ApiError(403));
    mockListCoverLetters.mockRejectedValueOnce(new TypeError('단절'));
    const { unmount } = renderList();
    jest.useFakeTimers();
    const { onmessage } = mockConnectReviewStatuses.mock.calls[0][0];
    await act(async () => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
      await jest.advanceTimersByTimeAsync(4000);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
    expect(appToast.error).toHaveBeenCalledTimes(1);
    await act(async () => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
    unmount();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(4000);
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
    expect(appToast.error).toHaveBeenCalledTimes(1);
  });

  it('갱신 요청 중 연속 이벤트는 하나의 후속 조회로 합쳐 최신 응답을 반영한다', async () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    let finishRefresh: (data: CoverLetterListResponse) => void = () => {};
    mockListCoverLetters.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRefresh = resolve;
        })
    );
    const latest = createResponse(1);
    latest.items[0].displayStatus = 'REVIEWED';
    mockListCoverLetters.mockResolvedValueOnce(latest);
    renderList();
    const { onmessage } = mockConnectReviewStatuses.mock.calls[0][0];
    await act(async () => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
    act(() => {
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
      onmessage({ event: 'cover-letter.review-status.changed', data: '{}', id: '' });
    });
    expect(mockListCoverLetters).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishRefresh(createResponse(1));
    });
    expect(await screen.findByText('첨삭 완료')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });
});
