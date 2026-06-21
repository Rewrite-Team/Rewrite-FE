import type { ReactNode } from 'react';

import { Spinner } from '@/shared/ui/spinner';

interface ButtonContentProps {
  children: ReactNode;
  isLoading: boolean;
}

export function ButtonContent({ children, isLoading }: ButtonContentProps) {
  if (isLoading) {
    return (
      <>
        <Spinner />
        <span className="sr-only">{children}</span>
      </>
    );
  }

  return <>{children}</>;
}
