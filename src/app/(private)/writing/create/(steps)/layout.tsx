'use client';

import type { ReactNode } from 'react';

import { useSelectedLayoutSegment } from 'next/navigation';

import { CoverLetterCreateLayout } from '@/widgets/cover-letter-create';

const STEP_HEADER = {
  step1: {
    title: '내 자기소개서 등록',
    description: '자기소개서 제목과 지원 회사, 직무 정보를 입력할 수 있습니다.',
  },
  step2: {
    title: '채용 우대사항 등록',
    description: '채용 공고의 우대사항을 입력해 자기소개서 작성에 반영할 수 있습니다.',
  },
  step3: {
    title: '자기소개서 작성',
    description: '자기소개서 문항별로 답변을 작성할 수 있습니다.',
  },
  step4: {
    title: '자기소개서 확인',
    description: '작성한 자기소개서 전체 내용을 확인하고 제출할 수 있습니다.',
  },
} as const;

interface WritingCreateStepsLayoutProps {
  children: ReactNode;
}

type StepSegment = keyof typeof STEP_HEADER;

const isStepSegment = (segment: string | null): segment is StepSegment =>
  segment !== null && segment in STEP_HEADER;

export default function WritingCreateStepsLayout({ children }: WritingCreateStepsLayoutProps) {
  const selectedSegment = useSelectedLayoutSegment();

  if (!isStepSegment(selectedSegment)) return children;

  const { description, title } = STEP_HEADER[selectedSegment];

  return (
    <CoverLetterCreateLayout description={description} sidebar={null} title={title}>
      {children}
    </CoverLetterCreateLayout>
  );
}
