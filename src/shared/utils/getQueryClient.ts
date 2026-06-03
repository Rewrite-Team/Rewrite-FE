import { environmentManager, QueryClient } from '@tanstack/react-query';

/**
 * 공통 기본 옵션이 적용된 QueryClient를 생성합니다.
 * 서버와 브라우저에서 QueryClient 생성 방식이 달라질 수 있으므로
 * 직접 생성하지 않고 이 함수에서만 생성 로직을 관리합니다.
 */
const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
};

/**
 * 브라우저에서 재사용할 QueryClient 인스턴스입니다.
 * 클라이언트 캐시가 유지되도록 한 번 생성한 인스턴스를 보관합니다.
 */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * 실행 환경에 맞는 QueryClient를 반환합니다.
 * 서버에서는 요청 간 캐시가 공유되지 않도록 매번 새 인스턴스를 만들고,
 * 브라우저에서는 캐시와 hydration 상태가 유지되도록 기존 인스턴스를 재사용합니다.
 */
export const getQueryClient = () => {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
};
