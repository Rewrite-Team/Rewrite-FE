import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

import { currentUserQueryOptions } from '@/entities/user';

import { RedirectAuthenticated } from './RedirectAuthenticated';
import { clearReturnTo, saveReturnTo } from '../model/returnTo';

const mockRouter = { replace: jest.fn() };
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

describe('RedirectAuthenticated', () => {
  beforeEach(() => {
    mockRouter.replace.mockClear();
    clearReturnTo();
  });

  it.each([
    [undefined, '/writing', 1],
    ['/writing?page=3', '/writing?page=3', 3],
    ['/writing/cover-letter-1', '/writing/cover-letter-1', undefined],
  ] as const)(
    '로그인 성공 시 복귀 경로 %s를 처리하고 필요한 페이지만 조회한다',
    (returnTo, destination, page) => {
      if (returnTo) {
        saveReturnTo(returnTo);
      }
      const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
      queryClient.setQueryData(currentUserQueryOptions.queryKey, {
        id: 'user-1',
        nickname: '사용자',
        profileImageUrl: null,
        provider: 'KAKAO',
        createdAt: '2026-10-13T00:00:00Z',
      });
      const prefetch = jest
        .spyOn(queryClient, 'prefetchQuery')
        .mockImplementation(() => new Promise(() => {}));
      const { unmount, rerender } = render(
        <QueryClientProvider client={queryClient}>
          <RedirectAuthenticated>로그인 화면</RedirectAuthenticated>
        </QueryClientProvider>
      );
      expect(mockRouter.replace).toHaveBeenCalledWith(destination);
      if (page === undefined) {
        expect(prefetch).not.toHaveBeenCalled();
      } else {
        expect(prefetch).toHaveBeenCalledTimes(1);
        expect(prefetch).toHaveBeenCalledWith(
          expect.objectContaining({ queryKey: ['cover-letters', 'list', { page, size: 6 }] })
        );
      }
      rerender(
        <QueryClientProvider client={queryClient}>
          <RedirectAuthenticated>로그인 화면</RedirectAuthenticated>
        </QueryClientProvider>
      );
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      unmount();
      queryClient.clear();
    }
  );

  it('인증이 확인되기 전에는 목록을 프리패칭하지 않는다', async () => {
    const queryClient = new QueryClient();
    // 실제 인증 API 대신 대기 중인 조회를 사용합니다.
    const fetchUser = jest
      .spyOn(currentUserQueryOptions, 'queryFn')
      .mockImplementation(() => new Promise(() => {}));
    const prefetch = jest.spyOn(queryClient, 'prefetchQuery');
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <RedirectAuthenticated>로그인 화면</RedirectAuthenticated>
      </QueryClientProvider>
    );

    await waitFor(() => expect(fetchUser).toHaveBeenCalledTimes(1));
    expect(prefetch).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    unmount();
    queryClient.clear();
    fetchUser.mockRestore();
  });
});
