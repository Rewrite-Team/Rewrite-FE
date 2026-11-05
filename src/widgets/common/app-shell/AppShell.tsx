import type { ReactNode } from 'react';

import { Footer } from '@/widgets/common/footer';
import { SessionHeader } from '@/widgets/common/header';

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
}

/** 공통 Header와 Footer를 사용하는 일반 페이지의 최상위 화면 구조입니다. */
export function AppShell({ children, header = <SessionHeader /> }: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      {header}
      <main className="flex min-h-0 flex-1 flex-col px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-0 w-full max-w-277.5 flex-1 flex-col">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
