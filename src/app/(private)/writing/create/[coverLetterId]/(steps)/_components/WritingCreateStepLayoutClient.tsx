'use client';

import { useState, type ReactNode } from 'react';

import { redirect, useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { useCoverLetterDetail } from '@/entities/cover-letter';
import {
  CoverLetterCreateDraftProvider,
  getCoverLetterCreateAvailableStep,
} from '@/features/cover-letter/create-flow';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
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
  const router = useRouter();
  const currentStepSegment = useSelectedLayoutSegment();
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const { data, isFetching, isPending, isRefetchError, refetch } =
    useCoverLetterDetail(coverLetterId);
  const savedAvailableStep = data ? getCoverLetterCreateAvailableStep(data) : 1;
  const [progress, setProgress] = useState({ coverLetterId, availableStep: savedAvailableStep });
  const availableStep =
    progress.coverLetterId === coverLetterId && progress.availableStep > savedAvailableStep
      ? progress.availableStep
      : savedAvailableStep;

  // 단계 수정·재조회로 저장값이 바뀌어도 같은 작성 흐름에서 이미 열린 단계는 다시 잠그지 않습니다.
  if (progress.coverLetterId !== coverLetterId || progress.availableStep !== availableStep) {
    setProgress({ coverLetterId, availableStep });
  }

  const handleRetry = () => {
    void refetch().then((result) => {
      if (!result.isError) return;
      if (result.error instanceof ApiError && result.error.status === 404) {
        appToast.error('자기소개서가 없거나 접근할 수 없습니다.');
        router.replace(ROUTES.WRITING);
      } else {
        appToast.error('자기소개서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    });
  };

  if (!isCoverLetterCreateStepSegment(currentStepSegment)) return children;

  if (isPending) {
    return (
      <WritingCreateStepShell currentStepSegment={currentStepSegment} availableStep={availableStep}>
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
        retry={{ onClick: handleRetry, isLoading: isFetching, disabled: isFetching }}
        title="자기소개서를 불러오지 못했어요"
      />
    );
  }

  // 제출된 자기소개서는 등록 폼 대신 현재 첨삭 상태를 확인하는 상세 화면으로 이동합니다.
  if (data.coverLetter.displayStatus !== 'WRITING') {
    redirect(ROUTES.WRITING_DETAIL(coverLetterId));
  }

  if (COVER_LETTER_STEP_CONFIG[currentStepSegment].step > availableStep) {
    redirect(ROUTES.WRITING_CREATE_STEP(coverLetterId, availableStep));
  }

  return (
    <CoverLetterCreateDraftProvider draft={data}>
      <WritingCreateStepShell currentStepSegment={currentStepSegment} availableStep={availableStep}>
        {children}
      </WritingCreateStepShell>
    </CoverLetterCreateDraftProvider>
  );
}
