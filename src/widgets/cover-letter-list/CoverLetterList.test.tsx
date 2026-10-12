import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { listCoverLetters } from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';
import { appToast } from '@/shared/lib/toast';

import { CoverLetterList } from './CoverLetterList';

jest.mock('@/entities/cover-letter/api/api', () => ({
  listCoverLetters: jest.fn(),
}));

jest.mock('@/shared/assets/icons/common', () => ({
  ChevronLeftIcon: 'svg',
  ChevronRightIcon: 'svg',
}));

jest.mock('@/shared/ui/lottie-animation', () => ({
  LottieAnimation: () => null,
}));

jest.mock('@/shared/lib/toast', () => ({
  appToast: { error: jest.fn() },
}));

const mockListCoverLetters = jest.mocked(listCoverLetters);
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
    mockRouter.replace.mockClear();
    jest.mocked(appToast.error).mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60 * 1000 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('캐시 없는 페이지 이동 시 이전 카드 대신 스켈레톤을 표시하고 페이지별 API를 조회한다', async () => {
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));
    mockListCoverLetters.mockImplementationOnce(() => new Promise(() => {}));
    const { container, rerender } = renderList();

    expect(screen.getByRole('status')).toHaveTextContent('목록을 불러오는 중');
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);

    expect(
      await screen.findByRole('link', { name: /1페이지 자기소개서.*상세 보기/ })
    ).toHaveAttribute('href', '/writing/cover-letter-1');
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
  });

  it('캐시된 목록의 백그라운드 재조회 중에는 스켈레톤으로 교체하지 않는다', () => {
    queryClient.setQueryData(['cover-letters', 'list', { page: 1, size: 6 }], createResponse(1));
    mockListCoverLetters.mockImplementation(() => new Promise(() => {}));

    renderList();
    void queryClient.invalidateQueries({ queryKey: ['cover-letters', 'list'] });

    expect(screen.getByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
});
