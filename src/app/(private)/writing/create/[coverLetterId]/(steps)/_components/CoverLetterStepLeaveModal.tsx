'use client';

import { useId } from 'react';

import { ModalActionButton } from '@/shared/ui/confirm-modal';
import { Surface } from '@/shared/ui/surface';

interface CoverLetterStepLeaveModalProps {
  open: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

/** 단계 이동 전 미저장 입력의 저장·버리기·이동 취소를 선택합니다. */
export function CoverLetterStepLeaveModal({
  open,
  isSaving,
  onOpenChange,
  onSave,
  onDiscard,
}: CoverLetterStepLeaveModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Surface
      open={open}
      onOpenChange={onOpenChange}
      canClose={!isSaving}
      closeOnEscape={!isSaving}
      closeOnOutsideClick={!isSaving}
      variant="modal"
    >
      <Surface.Portal>
        <Surface.Overlay />
        <Surface.Content
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="w-[min(25rem,calc(100vw-2rem))] gap-6 border border-white/5 p-6 text-center sm:p-7"
        >
          <Surface.Header className="flex flex-col gap-2">
            <h2 className="body-18 font-bold tracking-tight" id={titleId}>
              변경 내용을 저장할까요?
            </h2>
            <p className="body-14 break-keep text-gray-200" id={descriptionId}>
              저장하지 않고 이동하면
              <br />
              현재 단계의 변경 내용이 사라집니다.
            </p>
          </Surface.Header>
          <Surface.Footer className="grid w-full grid-cols-2 gap-x-2 gap-y-3">
            <ModalActionButton
              className="h-auto min-h-11 px-2 py-2.5 break-keep whitespace-normal"
              disabled={isSaving}
              onClick={onDiscard}
              variant="secondary"
            >
              저장하지 않고 이동
            </ModalActionButton>
            <ModalActionButton
              className="h-auto min-h-11 px-2 py-2.5 break-keep whitespace-normal"
              isLoading={isSaving}
              onClick={onSave}
            >
              저장 후 이동
            </ModalActionButton>
            <Surface.Close aria-label="취소" asChild>
              <ModalActionButton
                className="col-span-2 h-8 w-auto justify-self-center px-4 font-normal text-gray-200"
                disabled={isSaving}
                variant="ghost"
              >
                취소
              </ModalActionButton>
            </Surface.Close>
          </Surface.Footer>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}
