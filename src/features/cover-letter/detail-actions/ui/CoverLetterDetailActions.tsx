'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';

import { AIReviewRequirementModal } from './ai-review-requirement-modal/AIReviewRequirementModal';

interface CoverLetterDetailActionsProps {
  canSave?: boolean;
  hasUnsavedChanges?: boolean;
  isRereviewing?: boolean;
  isSaving?: boolean;
  onRereview: (requirement: string) => Promise<boolean> | boolean;
  onSave?: () => Promise<boolean> | boolean;
  version: string;
}

type OpenModal = 'requirement' | 'rereview' | 'save' | null;

/** 자기소개서 저장과 AI 재첨삭 요구사항 및 미저장 변경 경고 절차를 제공합니다. */
export function CoverLetterDetailActions({
  canSave = true,
  hasUnsavedChanges = false,
  isRereviewing = false,
  isSaving = false,
  onRereview,
  onSave,
  version,
}: CoverLetterDetailActionsProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [reviewRequirement, setReviewRequirement] = useState('');
  const isBusy = isSaving || isRereviewing;

  const handleSaveConfirm = async () => {
    const isSaved = await onSave?.();
    if (isSaved === false) return;

    setOpenModal(null);
  };

  const handleRereviewRequest = async (requirement: string) => {
    const isRequested = await onRereview(requirement);

    if (!isRequested) {
      return;
    }

    setReviewRequirement('');
    setOpenModal(null);
  };

  const handleRereviewConfirm = () => {
    void handleRereviewRequest(reviewRequirement);
  };

  const handleRequirementConfirm = (requirement: string) => {
    setReviewRequirement(requirement);

    if (hasUnsavedChanges) {
      setOpenModal('rereview');
      return;
    }

    void handleRereviewRequest(requirement);
  };

  return (
    <>
      <div
        aria-label="자기소개서 상세 작업"
        className="mt-17.5 flex flex-col gap-3 sm:flex-row sm:gap-6"
        role="group"
      >
        <Button
          className="h-14.75 w-full min-w-0 sm:w-auto sm:flex-1 sm:shrink"
          disabled={isBusy}
          onClick={() => setOpenModal('requirement')}
          variant="outline"
        >
          AI 첨삭 다시 받기
        </Button>
        <Button
          className="h-14.75 w-full min-w-0 sm:w-auto sm:flex-1 sm:shrink"
          onClick={() => setOpenModal('save')}
          disabled={!onSave || !canSave || isBusy}
        >
          저장하기
        </Button>
      </div>

      <ConfirmModal
        cancelLabel="아니오"
        confirmLabel="저장하기"
        description={`버전 ${version}로 저장됩니다.`}
        onConfirm={handleSaveConfirm}
        isLoading={isBusy}
        onOpenChange={(open) => setOpenModal(open ? 'save' : null)}
        open={openModal === 'save'}
        title="해당 자기소개서를 저장하시겠습니까?"
      />

      <AIReviewRequirementModal
        confirmLabel="AI 첨삭 다시 받기"
        isLoading={isBusy}
        onConfirm={handleRequirementConfirm}
        onOpenChange={(open) =>
          setOpenModal((currentModal) =>
            open ? 'requirement' : currentModal === 'requirement' ? null : currentModal
          )
        }
        onValueChange={setReviewRequirement}
        open={openModal === 'requirement'}
        placeholder="요구사항을 입력해 주세요."
        title="첨삭 요구사항"
        value={reviewRequirement}
      />

      <ConfirmModal
        cancelLabel="취소"
        confirmLabel="저장 후 다시 받기"
        description="변경한 최종 작성본을 저장한 뒤 AI 첨삭을 다시 요청합니다. 저장에 실패하면 재첨삭은 진행되지 않습니다."
        onConfirm={handleRereviewConfirm}
        isLoading={isBusy}
        onOpenChange={(open) =>
          setOpenModal((currentModal) =>
            open ? 'rereview' : currentModal === 'rereview' ? null : currentModal
          )
        }
        open={openModal === 'rereview'}
        title="AI 첨삭을 다시 받으시겠습니까?"
      />
    </>
  );
}
