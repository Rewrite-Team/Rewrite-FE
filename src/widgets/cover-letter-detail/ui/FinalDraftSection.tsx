'use client';

import { type ChangeEvent, useId, useState } from 'react';

import { EditIcon } from '@/shared/assets/icons/common';
import { Button } from '@/shared/ui/button';
import { TextArea } from '@/shared/ui/textarea';
import { Title } from '@/shared/ui/title';

interface FinalDraftSectionProps {
  characterLimit: number;
  initialValue: string;
  onDraftDirtyChange?: (isDirty: boolean) => void;
  onSave?: (value: string) => void;
  questionId: string;
  readOnly?: boolean;
}

/** 최종 작성본을 읽고 로컬에서 편집할 수 있는 문항별 섹션입니다. */
export function FinalDraftSection({
  characterLimit,
  initialValue,
  onDraftDirtyChange,
  onSave,
  questionId,
  readOnly = false,
}: FinalDraftSectionProps) {
  const generatedId = useId();
  const titleId = `final-draft-title-${generatedId}`;
  const [savedValue, setSavedValue] = useState(initialValue);
  const [draftValue, setDraftValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setDraftValue(savedValue);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftValue(savedValue);
    setIsEditing(false);
    onDraftDirtyChange?.(false);
  };

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.currentTarget.value;

    setDraftValue(nextValue);
    onDraftDirtyChange?.(nextValue !== savedValue);
  };

  const handleSave = () => {
    setSavedValue(draftValue);
    setIsEditing(false);
    onDraftDirtyChange?.(false);
    onSave?.(draftValue);
    // TODO: 최종 작성본 수정 API 연결 시 저장 mutation으로 교체한다.
  };

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <Title as="h3" className="body-18" id={titleId}>
            최종 작성본
          </Title>
          <p className="mt-2 mb-0 wrap-break-word body-16 text-gray-100">
            첨삭 내용을 참고하여 최종 작성본을 완성해 보세요.
          </p>
        </div>

        {isEditing ? (
          <div className="flex shrink-0 gap-2">
            <Button onClick={handleCancel} size="sm" variant="ghost">
              취소
            </Button>
            <Button onClick={handleSave} size="sm">
              저장
            </Button>
          </div>
        ) : readOnly ? null : (
          <Button
            aria-label="최종 작성본 편집"
            className="size-8"
            iconOnly
            onClick={handleEdit}
            variant="ghost"
          >
            <EditIcon aria-hidden="true" className="size-5" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <TextArea id={`final-draft-${questionId}`}>
          <TextArea.Label className="sr-only">최종 작성본</TextArea.Label>
          <TextArea.Field
            autoFocus
            onChange={handleDraftChange}
            recommendedLength={characterLimit}
            showCount
            value={draftValue}
          />
        </TextArea>
      ) : (
        <div className="flex min-h-81.75 flex-col rounded-lg bg-gray-600 px-5 py-6 text-white">
          <p className="m-0 wrap-break-word whitespace-pre-wrap body-16">{savedValue}</p>
          <p
            aria-label={`${characterLimit}자 중 ${savedValue.length}자 작성`}
            className="mt-auto mb-0 pt-8 text-right body-16"
          >
            <span className="text-primary-500">{savedValue.length}</span>
            <span>/{characterLimit}자</span>
          </p>
        </div>
      )}
    </section>
  );
}
