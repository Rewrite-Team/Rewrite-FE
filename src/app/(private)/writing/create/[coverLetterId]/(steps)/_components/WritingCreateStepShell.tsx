'use client';

import type { ReactNode } from 'react';

import { useParams } from 'next/navigation';

import {
  useCoverLetterCreateValidation,
  useCoverLetterStepNavigation,
  CoverLetterStepLeaveModal,
  type WritingCreateStep,
} from '@/features/cover-letter/create-flow';
import { PageHeader } from '@/shared/ui/page-header';
import { COVER_LETTER_STEP_CONFIG, CoverLetterStepPanel } from '@/widgets/cover-letter-create';

import type { CoverLetterCreateStepSegment } from '../types';

interface WritingCreateStepShellProps {
  children: ReactNode;
  currentStepSegment: CoverLetterCreateStepSegment;
  availableStep: WritingCreateStep;
}

/**
 * 선택된 STEP의 헤더, 진행 패널, 페이지 폼 영역을 공통 레이아웃으로 조립합니다.
 * 다음 버튼은 폼의 검증·저장에 맡기고 단계 번호 이동 시 미저장 변경을 확인합니다.
 *
 * @param children - 현재 STEP 페이지의 폼 콘텐츠
 * @param currentStepSegment - 현재 STEP의 라우트 세그먼트
 * @param availableStep - 공통 레이아웃이 유지하는 가장 멀리 열린 단계
 */
export function WritingCreateStepShell({
  children,
  currentStepSegment,
  availableStep,
}: WritingCreateStepShellProps) {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const { description, step, title } = COVER_LETTER_STEP_CONFIG[currentStepSegment];
  const {
    isActionDisabled,
    nextActionStatus,
    saveDraftActionStatus,
    isLeaveModalOpen,
    isSavingBeforeLeave,
    handleStepSelect,
    handleSaveAndLeave,
    handleDiscardAndLeave,
    handleLeaveModalOpenChange,
  } = useCoverLetterStepNavigation({ coverLetterId, currentStep: step, availableStep });
  const { errors } = useCoverLetterCreateValidation();
  const errorSteps: WritingCreateStep[] = [...new Set(errors.map((error) => error.step))];

  const stepPanel =
    step === 4 ? (
      <CoverLetterStepPanel
        submitAction={{ status: isActionDisabled ? 'disabled' : 'enabled' }}
        currentStep={step}
        availableStep={availableStep}
        errorSteps={errorSteps}
        onStepSelect={handleStepSelect}
      />
    ) : (
      <CoverLetterStepPanel
        currentStep={step}
        availableStep={availableStep}
        errorSteps={errorSteps}
        nextAction={{ status: nextActionStatus }}
        onStepSelect={handleStepSelect}
        saveDraftAction={{ status: saveDraftActionStatus }}
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
      <CoverLetterStepLeaveModal
        open={isLeaveModalOpen}
        isSaving={isSavingBeforeLeave}
        onOpenChange={handleLeaveModalOpenChange}
        onSave={() => void handleSaveAndLeave()}
        onDiscard={handleDiscardAndLeave}
      />
    </div>
  );
}
