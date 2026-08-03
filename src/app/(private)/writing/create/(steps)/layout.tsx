import type { ReactNode } from 'react';

import { WritingCreateStepLayoutClient } from './WritingCreateStepLayoutClient';

interface WritingCreateLayoutProps {
  children: ReactNode;
}

export default function WritingCreateLayout({ children }: WritingCreateLayoutProps) {
  return <WritingCreateStepLayoutClient>{children}</WritingCreateStepLayoutClient>;
}
