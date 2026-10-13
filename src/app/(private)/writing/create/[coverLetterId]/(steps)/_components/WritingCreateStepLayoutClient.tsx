'use client';

import type { ReactNode } from 'react';

import { redirect, useParams, useSelectedLayoutSegment } from 'next/navigation';

import { useCoverLetterDetail } from '@/entities/cover-letter';
import {
  CoverLetterCreateDraftProvider,
  getCoverLetterCreateAvailableStep,
} from '@/features/cover-letter/create-flow';
import { ROUTES } from '@/shared/constants/routes';
import { ErrorState } from '@/shared/ui/state-feedback';
import { COVER_LETTER_STEP_CONFIG, CoverLetterCreateSkeleton } from '@/widgets/cover-letter-create';

import { WritingCreateStepShell } from './WritingCreateStepShell';

import type { CoverLetterCreateStepSegment } from '../types';

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
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const { data, isFetching, isPending, isRefetchError, refetch } =
    useCoverLetterDetail(coverLetterId);

  if (!isCoverLetterCreateStepSegment(currentStepSegment)) return children;

  if (isPending) {
    return (
      <WritingCreateStepShell currentStepSegment={currentStepSegment}>
        <CoverLetterCreateSkeleton
          currentStep={COVER_LETTER_STEP_CONFIG[currentStepSegment].step}
        />
      </WritingCreateStepShell>
    );
  }

  if (!data || (currentStepSegment === 'step4' && isRefetchError)) {
    return (
      <ErrorState
        className="self-center"
        description="잠시 후 다시 시도해 주세요."
        retry={{ onClick: () => void refetch(), isLoading: isFetching, disabled: isFetching }}
        title="자기소개서를 불러오지 못했어요"
      />
    );
  }

  // 제출된 자기소개서는 등록 폼 대신 현재 첨삭 상태를 확인하는 상세 화면으로 이동합니다.
  if (data.coverLetter.displayStatus !== 'WRITING') {
    redirect(ROUTES.WRITING_DETAIL(coverLetterId));
  }

  const availableStep = getCoverLetterCreateAvailableStep(data);
  if (COVER_LETTER_STEP_CONFIG[currentStepSegment].step > availableStep) {
    redirect(ROUTES.WRITING_CREATE_STEP(coverLetterId, availableStep));
  }

  return (
    <CoverLetterCreateDraftProvider draft={data}>
      <WritingCreateStepShell currentStepSegment={currentStepSegment}>
        {children}
      </WritingCreateStepShell>
    </CoverLetterCreateDraftProvider>
  );
}
