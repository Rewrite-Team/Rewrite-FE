'use client';

import { useState } from 'react';

import { AIReviewRequirementModal } from '@/entities/review-version';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';

interface CoverLetterDetailActionsProps {
  hasUnsavedChanges?: boolean;
  onRereview?: (requirement: string) => void;
  onSave?: () => void;
  version: string;
}

type OpenModal = 'requirement' | 'rereview' | 'save' | null;

/** 자기소개서 저장과 AI 재첨삭 요구사항 및 미저장 변경 경고 절차를 제공합니다. */
export function CoverLetterDetailActions({
  hasUnsavedChanges = false,
  onRereview,
  onSave,
  version,
}: CoverLetterDetailActionsProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [reviewRequirement, setReviewRequirement] = useState('');

  const handleSaveConfirm = () => {
    onSave?.();
    setOpenModal(null);
    // TODO: 최종 작성본 저장 API mutation을 실행한다.
  };

  const handleRereviewRequest = (requirement: string) => {
    onRereview?.(requirement);
    setOpenModal(null);
  };

  const handleRereviewConfirm = () => {
    handleRereviewRequest(reviewRequirement);
  };

  const handleRequirementConfirm = (requirement: string) => {
    setReviewRequirement(requirement);

    if (hasUnsavedChanges) {
      setOpenModal('rereview');
      return;
    }

    handleRereviewRequest(requirement);
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
          onClick={() => setOpenModal('requirement')}
          variant="outline"
        >
          AI 첨삭 다시 받기
        </Button>
        <Button
          className="h-14.75 w-full min-w-0 sm:w-auto sm:flex-1 sm:shrink"
          onClick={() => setOpenModal('save')}
        >
          저장하기
        </Button>
      </div>

      <ConfirmModal
        cancelLabel="아니오"
        confirmLabel="저장하기"
        description={`버전 ${version}로 저장됩니다.`}
        onConfirm={handleSaveConfirm}
        onOpenChange={(open) => setOpenModal(open ? 'save' : null)}
        open={openModal === 'save'}
        title="해당 자기소개서를 저장하시겠습니까?"
      />

      <AIReviewRequirementModal
        confirmLabel="AI 첨삭 다시 받기"
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
        cancelLabel="아니오"
        confirmLabel="다시 받기"
        description="저장하지 않은 내용은 삭제됩니다."
        onConfirm={handleRereviewConfirm}
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
