'use client';

import type { ReactNode } from 'react';

import { useSelectedLayoutSegment } from 'next/navigation';

import {
  COVER_LETTER_STEP_CONFIG,
  type CoverLetterCreateStepSegment,
} from '@/widgets/cover-letter-create';

import { WritingCreateStepShell } from './WritingCreateStepShell';

interface WritingCreateStepLayoutClientProps {
  children: ReactNode;
}

const isCoverLetterCreateStepSegment = (
  segment: string | null
): segment is CoverLetterCreateStepSegment =>
  segment !== null && Object.hasOwn(COVER_LETTER_STEP_CONFIG, segment);

/**
 * App Router의 현재 STEP 세그먼트를 판별하고 공통 등록 화면을 구성합니다.
 * STEP이 아닌 하위 세그먼트는 공통 화면 처리 없이 그대로 렌더링합니다.
 *
 * @param children - 현재 하위 라우트 콘텐츠
 */
export function WritingCreateStepLayoutClient({ children }: WritingCreateStepLayoutClientProps) {
  const currentStepSegment = useSelectedLayoutSegment();

  if (!isCoverLetterCreateStepSegment(currentStepSegment)) return children;

  return (
    <WritingCreateStepShell currentStepSegment={currentStepSegment}>
      {children}
    </WritingCreateStepShell>
  );
}
