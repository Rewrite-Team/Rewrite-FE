'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/constants/routes';

import { useIsSavingCoverLetterDraft } from './useSaveCoverLetterBasicInfo';
import {
  useCoverLetterCreateDraft,
  useCoverLetterCreateDirtyStep,
  useCoverLetterCreateDraftSave,
} from '../ui/CoverLetterCreateDraftContext';

import type { WritingCreateStep } from '../model/writingCreateStep';

interface CoverLetterStepNavigationOptions {
  coverLetterId: string;
  currentStep: WritingCreateStep;
  availableStep: WritingCreateStep;
}

/**
 * ## useCoverLetterStepNavigation
 *
 * @description
 * 단계 번호 이동 시 미저장 변경 확인과 저장·버리기·취소를 처리합니다.
 * 저장 실패 시 현재 폼을 유지하고, 저장 성공 시에만 선택한 단계로 이동합니다.
 * 패널 버튼 상태도 같은 저장 상태에서 계산해 화면이 이동 정책을 직접 관리하지 않도록 합니다.
 *
 * @example
 * ```tsx
 * const navigation = useCoverLetterStepNavigation({ coverLetterId, currentStep, availableStep });
 * <CoverLetterStepPanel onStepSelect={navigation.handleStepSelect} {...panelProps} />
 * ```
 */
export function useCoverLetterStepNavigation({
  coverLetterId,
  currentStep,
  availableStep,
}: CoverLetterStepNavigationOptions) {
  const router = useRouter();
  const isSaving = useIsSavingCoverLetterDraft(coverLetterId);
  const draft = useCoverLetterCreateDraft();
  const dirtyStep = useCoverLetterCreateDirtyStep();
  const { saveDraft, savingIntent } = useCoverLetterCreateDraftSave();
  const [pendingStep, setPendingStep] = useState<WritingCreateStep | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  const isActionDisabled = !draft || isSaving || savingIntent !== null;
  // 모달에서 저장할 때는 패널 버튼에 로딩을 중복 표시하지 않습니다.
  const panelSavingIntent = isSavingBeforeLeave ? null : savingIntent;
  const nextActionStatus =
    panelSavingIntent === 'next' ? 'loading' : isActionDisabled ? 'disabled' : 'enabled';
  const saveDraftActionStatus =
    panelSavingIntent === 'draft'
      ? 'loading'
      : isActionDisabled || dirtyStep !== currentStep
        ? 'disabled'
        : 'enabled';

  const handleStepSelect = (targetStep: WritingCreateStep) => {
    if (targetStep === currentStep || targetStep > availableStep || isActionDisabled) return;

    if (dirtyStep === currentStep) {
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
      // 실패 시 현재 폼에서 오류를 수정할 수 있도록 모달만 닫습니다.
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

  const handleLeaveModalOpenChange = (open: boolean) => {
    if (!open && !isSavingBeforeLeave) setPendingStep(null);
  };

  return {
    isActionDisabled,
    nextActionStatus,
    saveDraftActionStatus,
    isLeaveModalOpen: pendingStep !== null,
    isSavingBeforeLeave,
    handleStepSelect,
    handleSaveAndLeave,
    handleDiscardAndLeave,
    handleLeaveModalOpenChange,
  } as const;
}
