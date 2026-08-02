import type { ReactNode } from 'react';

import { WritingCreateStepsLayoutClient } from './WritingCreateStepsLayoutClient';

interface WritingCreateStepsLayoutProps {
  children: ReactNode;
}

export default function WritingCreateStepsLayout({ children }: WritingCreateStepsLayoutProps) {
  return <WritingCreateStepsLayoutClient>{children}</WritingCreateStepsLayoutClient>;
}
