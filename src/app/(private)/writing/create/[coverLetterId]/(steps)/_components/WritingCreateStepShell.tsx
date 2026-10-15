'use client';

import type { ReactNode } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  useCoverLetterCreateDraft,
  useCoverLetterCreateValidation,
  useIsSavingCoverLetterDraft,
  type WritingCreateStep,
} from '@/features/cover-letter/create-flow';
import { ROUTES } from '@/shared/constants/routes';
import { PageHeader } from '@/shared/ui/page-header';
import { COVER_LETTER_STEP_CONFIG, CoverLetterStepPanel } from '@/widgets/cover-letter-create';

import type { CoverLetterCreateStepSegment } from '../types';

interface WritingCreateStepShellProps {
  children: ReactNode;
  currentStepSegment: CoverLetterCreateStepSegment;
}

/**
 * 선택된 STEP의 헤더, 진행 패널, 페이지 폼 영역을 공통 레이아웃으로 조립합니다.
 * 다음 단계 이동은 폼의 검증·저장에 맡기고 이전 단계 이동은 저장 중에 차단합니다.
 *
 * @param children - 현재 STEP 페이지의 폼 콘텐츠
 * @param currentStepSegment - 현재 STEP의 라우트 세그먼트
 */
export function WritingCreateStepShell({
  children,
  currentStepSegment,
}: WritingCreateStepShellProps) {
  const router = useRouter();
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const isSaving = useIsSavingCoverLetterDraft(coverLetterId);
  const draft = useCoverLetterCreateDraft();
  const { errors } = useCoverLetterCreateValidation();
  const errorSteps: WritingCreateStep[] = [...new Set(errors.map((error) => error.step))];
  const isActionDisabled = !draft || isSaving;
  const { description, step, title } = COVER_LETTER_STEP_CONFIG[currentStepSegment];

  const handleStepSelect = (targetStep: WritingCreateStep) => {
    if ((targetStep >= step && !errorSteps.includes(targetStep)) || isActionDisabled) return;

    router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, targetStep));
  };

  const stepPanel =
    step === 4 ? (
      <CoverLetterStepPanel
        completeAction={{ status: isActionDisabled ? 'disabled' : 'enabled' }}
        currentStep={step}
        errorSteps={errorSteps}
        onStepSelect={handleStepSelect}
      />
    ) : (
      <CoverLetterStepPanel
        currentStep={step}
        errorSteps={errorSteps}
        nextAction={{ status: isActionDisabled ? 'disabled' : 'enabled' }}
        onStepSelect={handleStepSelect}
        saveDraftAction={{
          status: isActionDisabled ? 'disabled' : 'enabled',
        }}
      />
    );

  return (
    <div className="grid w-full grid-cols-1 items-start lg:grid-cols-[minmax(0,728fr)_minmax(16rem,352fr)] lg:gap-x-7.5">
      <PageHeader className="lg:col-start-1" description={description} title={title} />

      <aside
        aria-label="자기소개서 등록 진행 및 작업"
        className="contents lg:col-start-2 lg:row-start-2 lg:mt-9 lg:block"
      >
        {stepPanel}
      </aside>

      <div className="row-start-3 mt-9 min-w-0 lg:col-start-1 lg:row-start-2">{children}</div>
    </div>
  );
}
