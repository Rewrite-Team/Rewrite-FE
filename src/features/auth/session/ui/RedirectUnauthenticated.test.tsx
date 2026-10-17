import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { currentUserQueryOptions, type CurrentUserResponse } from '@/entities/user';

import { RedirectUnauthenticated } from './RedirectUnauthenticated';
import { clearReturnTo, saveReturnTo } from '../model/returnTo';

const mockRouter = { replace: jest.fn() };
const currentUser: CurrentUserResponse = {
  id: 'user-1',
  nickname: '사용자',
  profileImageUrl: null,
  provider: 'KAKAO',
  createdAt: '2026-10-13T00:00:00Z',
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/writing',
}));

describe('RedirectUnauthenticated 로그인 복귀', () => {
  beforeEach(() => {
    mockRouter.replace.mockClear();
    clearReturnTo();
    window.history.replaceState(null, '', '/writing');
  });

  it.each([
    ['/writing?page=3', 3],
    ['/writing?page=invalid', 1],
    ['/writing', 1],
  ] as const)('목록 복귀 경로 %s의 페이지를 인증 확인 후 프리패칭한다', (returnTo, page) => {
    saveReturnTo(returnTo);
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
    queryClient.setQueryData(currentUserQueryOptions.queryKey, currentUser);
    const prefetch = jest
      .spyOn(queryClient, 'prefetchQuery')
      .mockImplementation(() => new Promise(() => {}));
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <RedirectUnauthenticated>목록 화면</RedirectUnauthenticated>
      </QueryClientProvider>
    );

    expect(prefetch).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['cover-letters', 'list', { page, size: 6 }],
      })
    );
    if (returnTo !== '/writing') {
      expect(mockRouter.replace).toHaveBeenCalledWith(returnTo);
    }
    unmount();
    queryClient.clear();
  });

  it('상세 화면으로 복귀할 때는 목록을 프리패칭하지 않는다', () => {
    saveReturnTo('/writing/cover-letter-1');
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
    queryClient.setQueryData(currentUserQueryOptions.queryKey, currentUser);
    const prefetch = jest.spyOn(queryClient, 'prefetchQuery');
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <RedirectUnauthenticated>목록 화면</RedirectUnauthenticated>
      </QueryClientProvider>
    );

    expect(prefetch).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/writing/cover-letter-1');
    unmount();
    queryClient.clear();
  });
});
