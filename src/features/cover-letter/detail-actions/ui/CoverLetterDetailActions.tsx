'use client';

import { useState } from 'react';

import { AIReviewRequirementModal } from '@/entities/review-version';
import { Button } from '@/shared/ui/button';
import { ConfirmModal } from '@/shared/ui/confirm-modal';

interface CoverLetterDetailActionsProps {
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  version: string;
}

type OpenModal = 'requirement' | 'rereview' | 'save' | null;

/** 자기소개서 저장과 AI 재첨삭 요청 전 확인 절차를 제공합니다. */
export function CoverLetterDetailActions({
  hasUnsavedChanges = false,
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

  const handleRereviewConfirm = () => {
    setOpenModal(null);
    // TODO: reviewRequirement를 포함해 AI 재첨삭 API mutation을 실행한다.
  };

  const handleRequirementConfirm = (requirement: string) => {
    setReviewRequirement(requirement);
    setOpenModal('rereview');
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
        description={
          hasUnsavedChanges ? '저장하지 않은 내용은 삭제됩니다.' : '저장한 버전은 유지됩니다.'
        }
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
