'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getQueryClient } from '@/shared/utils/getQueryClient';

/**
 * {@link QueryProvider}에 전달되는 속성입니다.
 */
interface QueryProviderProps {
  /**
   * 공통 React Query 컨텍스트를 제공받을 하위 컴포넌트입니다.
   */
  children: ReactNode;
}

/**
 * 클라이언트 컴포넌트 트리에 안정적인 React Query 클라이언트를 제공합니다.
 *
 * Query Client는 Provider 인스턴스마다 지연 생성되며, 재렌더링 사이에서도
 * 동일한 인스턴스를 재사용합니다. 개발 환경에서는 디버깅을 위해 React Query
 * Devtools도 함께 마운트합니다.
 *
 * @param props - Provider 속성입니다.
 * @param props.children - React Query 훅을 사용하는 하위 노드입니다.
 * @returns 전달받은 하위 요소를 감싸는 React Query Provider입니다.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
