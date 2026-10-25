'use client';

import { useState, type ReactNode } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  useCoverLetterCreateDraft,
  useCoverLetterCreateValidation,
  useCoverLetterCreateDirtyStep,
  useCoverLetterCreateDraftSave,
  useIsSavingCoverLetterDraft,
  type WritingCreateStep,
} from '@/features/cover-letter/create-flow';
import { ROUTES } from '@/shared/constants/routes';
import { PageHeader } from '@/shared/ui/page-header';
import { COVER_LETTER_STEP_CONFIG, CoverLetterStepPanel } from '@/widgets/cover-letter-create';

import { CoverLetterStepLeaveModal } from './CoverLetterStepLeaveModal';

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
  const router = useRouter();
  const { coverLetterId } = useParams<{ coverLetterId: string }>();
  const isSaving = useIsSavingCoverLetterDraft(coverLetterId);
  const draft = useCoverLetterCreateDraft();
  const dirtyStep = useCoverLetterCreateDirtyStep();
  const { saveDraft, savingIntent } = useCoverLetterCreateDraftSave();
  const [pendingStep, setPendingStep] = useState<WritingCreateStep | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  const { errors } = useCoverLetterCreateValidation();
  const errorSteps: WritingCreateStep[] = [...new Set(errors.map((error) => error.step))];
  const isActionDisabled = !draft || isSaving || savingIntent !== null;
  // 이동 확인 모달에서 저장한 경우에는 모달 버튼에서만 로딩을 표시합니다.
  const panelSavingIntent = isSavingBeforeLeave ? null : savingIntent;
  const { description, step, title } = COVER_LETTER_STEP_CONFIG[currentStepSegment];

  const handleStepSelect = (targetStep: WritingCreateStep) => {
    if (targetStep === step || targetStep > availableStep || isActionDisabled) return;

    if (dirtyStep === step) {
      setPendingStep(targetStep);
      return;
    }
    router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, targetStep));
  };

  const handleSaveAndLeave = async () => {
    if (pendingStep === null || isSavingBeforeLeave || isSaving || !saveDraft) return;
    setIsSavingBeforeLeave(true);
    try {
      const isSaved = await saveDraft();
      // 실패 시에는 현재 폼에서 오류를 확인하고 수정할 수 있도록 모달만 닫습니다.
      setPendingStep(null);
      if (isSaved) router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, pendingStep));
    } finally {
      setIsSavingBeforeLeave(false);
    }
  };

  const handleDiscardAndLeave = () => {
    if (pendingStep === null || isSavingBeforeLeave) return;
    router.push(ROUTES.WRITING_CREATE_STEP(coverLetterId, pendingStep));
    setPendingStep(null);
  };

  const stepPanel =
    step === 4 ? (
      <CoverLetterStepPanel
        completeAction={{ status: isActionDisabled ? 'disabled' : 'enabled' }}
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
        nextAction={{
          status:
            panelSavingIntent === 'next' ? 'loading' : isActionDisabled ? 'disabled' : 'enabled',
        }}
        onStepSelect={handleStepSelect}
        saveDraftAction={{
          status:
            panelSavingIntent === 'draft'
              ? 'loading'
              : isActionDisabled || dirtyStep !== step
                ? 'disabled'
                : 'enabled',
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
      <CoverLetterStepLeaveModal
        open={pendingStep !== null}
        isSaving={isSavingBeforeLeave}
        onOpenChange={(open) => {
          if (!open && !isSavingBeforeLeave) setPendingStep(null);
        }}
        onSave={() => void handleSaveAndLeave()}
        onDiscard={handleDiscardAndLeave}
      />
    </div>
  );
}
