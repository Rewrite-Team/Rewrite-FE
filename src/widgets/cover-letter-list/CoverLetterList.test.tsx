import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { listCoverLetters } from '@/entities/cover-letter';
import type { CoverLetterListResponse } from '@/entities/cover-letter';

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

const mockListCoverLetters = jest.mocked(listCoverLetters);

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
  });

  it('최초 요청 실패를 빈 목록과 구분하고 재시도로 목록을 복구한다', async () => {
    mockListCoverLetters.mockRejectedValueOnce(new Error('조회 실패'));
    mockListCoverLetters.mockResolvedValueOnce(createResponse(1));

    renderList();

    expect(await screen.findByRole('alert')).toHaveTextContent('자기소개서를 불러오지 못했어요');
    expect(screen.queryByText('아직 작성한 자기소개서가 없어요')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('1페이지 자기소개서')).toBeInTheDocument();
    expect(mockListCoverLetters).toHaveBeenCalledTimes(2);
  });
});
