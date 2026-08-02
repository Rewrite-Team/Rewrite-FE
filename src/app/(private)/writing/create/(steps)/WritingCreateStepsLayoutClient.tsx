'use client';

import type { ReactNode } from 'react';

import { useSelectedLayoutSegment } from 'next/navigation';

import { CoverLetterCreateFlowProvider } from '@/features/cover-letter/create-flow';
import {
  COVER_LETTER_CREATE_STEP_CONFIG,
  isCoverLetterCreateStepSegment,
} from '@/widgets/cover-letter-create';

import { WritingCreateStepsContent } from './WritingCreateStepsContent';

interface WritingCreateStepsLayoutClientProps {
  children: ReactNode;
}

/**
 * App Router의 현재 STEP 세그먼트를 판별하고 등록 플로우 Provider를 구성합니다.
 * STEP이 아닌 하위 세그먼트는 별도 플로우 처리 없이 그대로 렌더링합니다.
 *
 * @param children - 현재 하위 라우트 콘텐츠
 */
export function WritingCreateStepsLayoutClient({ children }: WritingCreateStepsLayoutClientProps) {
  const selectedSegment = useSelectedLayoutSegment();

  if (!isCoverLetterCreateStepSegment(selectedSegment)) return children;

  const { step } = COVER_LETTER_CREATE_STEP_CONFIG[selectedSegment];

  return (
    <CoverLetterCreateFlowProvider currentStep={step}>
      <WritingCreateStepsContent selectedSegment={selectedSegment}>
        {children}
      </WritingCreateStepsContent>
    </CoverLetterCreateFlowProvider>
  );
}
