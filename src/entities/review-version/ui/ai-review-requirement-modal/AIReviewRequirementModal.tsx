'use client';

import { useId } from 'react';
import type { ComponentProps } from 'react';

import { CancelIcon } from '@/shared/assets/icons/common';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { useControllableState } from '@/shared/hooks';
import { Button } from '@/shared/ui/button';
import { Surface } from '@/shared/ui/surface';
import { TextArea } from '@/shared/ui/textarea';
import { Title } from '@/shared/ui/title';

import type { AIReviewRequirementModalProps } from './AIReviewRequirementModal.types';

const limitRequirementLength = (value: string, maxLength: number) => value.slice(0, maxLength);

/**
 * AI 첨삭에 반영할 요구사항을 입력하고 다시 첨삭을 요청하는 모달입니다.
 *
 * @remarks
 * 자기소개서 상세 화면에서 사용자가 재첨삭 전에 추가 요청사항을 작성하는 흐름에 사용합니다.
 * `open`을 전달하면 controlled modal로 동작하고, 생략하면 `defaultOpen` 기준으로 내부 열림
 * 상태를 관리합니다. 요구사항 입력값도 `value`/`onValueChange`로 controlled 방식을 지원하며,
 * 확인 버튼을 누르면 현재 입력값이 `onConfirm`에 전달됩니다.
 *
 * 접근성 처리는 `Surface`를 통해 Focus Trap, ESC 닫기, 외부 클릭 닫기, Scroll Lock을
 * 재사용합니다. `aria-labelledby`는 제목에, `aria-describedby`는 숨김 안내 문구에 연결됩니다.
 */
export function AIReviewRequirementModal({
  closeOnEscape = true,
  closeOnOutsideClick = true,
  confirmLabel = 'AI 첨삭 다시 받기',
  defaultValue = '',
  isLoading = false,
  maxLength = INPUT_LIMITS.AI_REVIEW_REQUIREMENT,
  onConfirm,
  onValueChange,
  placeholder = 'AI 첨삭에 반영할 요구사항을 입력해 주세요.',
  textareaDisabled = false,
  title = 'AI 첨삭 요구사항',
  value,
  ...surfaceProps
}: AIReviewRequirementModalProps) {
  const generatedId = useId();
  const titleId = `ai-review-requirement-modal-title-${generatedId}`;
  const descriptionId = `ai-review-requirement-modal-description-${generatedId}`;
  const requirementFieldId = `ai-review-requirement-modal-field-${generatedId}`;
  const [requirement, setRequirement] = useControllableState({
    defaultValue: () => limitRequirementLength(defaultValue, maxLength),
    onChange: onValueChange,
    value: value === undefined ? undefined : limitRequirementLength(value, maxLength),
  });
  const hasRequirement = requirement.length > 0;

  const handleRequirementChange: NonNullable<ComponentProps<typeof TextArea.Field>['onChange']> = (
    event
  ) => {
    setRequirement(limitRequirementLength(event.currentTarget.value, maxLength));
  };

  const handleConfirm = () => {
    onConfirm(requirement);
  };

  return (
    <Surface
      {...surfaceProps}
      canClose={!isLoading}
      closeOnEscape={!isLoading && !hasRequirement && closeOnEscape}
      closeOnOutsideClick={!isLoading && !hasRequirement && closeOnOutsideClick}
      variant="modal"
    >
      <Surface.Portal>
        <Surface.Overlay />
        <Surface.Content
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className="max-w-130 gap-0 p-6"
        >
          <Surface.Header className="flex flex-row items-center justify-between">
            <Title as="h2" className="body-18" id={titleId}>
              {title}
            </Title>
            <Surface.Close aria-label="AI 첨삭 요구사항 모달 닫기" asChild>
              <Button
                aria-label="AI 첨삭 요구사항 모달 닫기"
                disabled={isLoading}
                iconOnly
                variant="ghost"
                className="size-8"
              >
                <CancelIcon aria-hidden="true" />
              </Button>
            </Surface.Close>
          </Surface.Header>
          <p className="sr-only" id={descriptionId}>
            AI 첨삭에 반영할 요구사항을 입력한 뒤 다시 첨삭을 요청할 수 있습니다.
          </p>

          <Surface.Body className="mt-3">
            <TextArea disabled={textareaDisabled} id={requirementFieldId}>
              <TextArea.Label className="sr-only">AI 첨삭 요구사항</TextArea.Label>
              <TextArea.Field
                className="min-h-50 w-full resize-none font-normal"
                maxLength={maxLength}
                onChange={handleRequirementChange}
                placeholder={placeholder}
                showCount
                value={requirement}
              />
              <TextArea.ErrorMessage />
            </TextArea>
          </Surface.Body>

          <Surface.Footer className="mt-10">
            <Button
              className="w-full"
              isLoading={isLoading}
              onClick={handleConfirm}
              size="md"
              variant="primary"
            >
              {confirmLabel}
            </Button>
          </Surface.Footer>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}
