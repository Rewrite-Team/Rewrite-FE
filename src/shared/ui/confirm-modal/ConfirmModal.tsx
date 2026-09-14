'use client';

import { useId } from 'react';

import { Button } from '@/shared/ui/button';
import { Surface } from '@/shared/ui/surface';
import { Title } from '@/shared/ui/title';

import type { ConfirmModalProps } from './ConfirmModal.types';

/**
 * ## ConfirmModal
 *
 * @description
 * 확인/취소 선택이 필요한 짧은 의사결정 UI입니다. 제목, 설명, 확인 버튼, 취소 버튼과
 * 확인 작업의 loading 상태를 제공합니다.
 *
 * ### 주요 내용
 *
 * `Surface`를 기반으로 Focus Trap, Focus Restore, ESC 닫기, 외부 클릭 닫기, Scroll Lock을
 * 재사용합니다. `isLoading` 중에는 확인 버튼에 로딩 표시를 보여주고, 취소 및 dismiss 닫기를
 * 비활성화해 중복 액션을 막습니다.
 *
 * ### 접근성
 *
 * 제목과 설명은 각각 `aria-labelledby`, `aria-describedby`로 dialog에 연결됩니다.
 *
 * @param cancelLabel - 모달 하단에 표시할 취소 버튼 문구입니다.
 * @param closeOnEscape - ESC 키로 닫을 수 있는지 여부입니다.
 * @param closeOnOutsideClick - 외부 영역 클릭으로 닫을 수 있는지 여부입니다.
 * @param confirmLabel - 모달 하단에 표시할 확인 버튼 문구입니다.
 * @param defaultOpen - uncontrolled 방식에서 최초로 열어둘지 여부입니다.
 * @param description - 제목 아래에 표시할 짧은 설명 문구입니다.
 * @param focusTrap - 열린 동안 포커스를 Content 내부에 가둘지 여부입니다.
 * @param isLoading - 확인 작업 진행 여부입니다. true이면 확인 버튼 로딩 표시와 dismiss 닫기 방지를 적용합니다.
 * @param onCancel - 취소 버튼 클릭 시 호출됩니다.
 * @param onClosePrevented - 닫기 요청이 정책에 의해 차단됐을 때 호출됩니다.
 * @param onConfirm - 확인 버튼 클릭 시 호출됩니다.
 * @param onOpenChange - 열림 상태가 변경될 때 호출됩니다.
 * @param open - controlled 방식으로 열림 상태를 제어할 때 사용합니다.
 * @param restoreFocus - 닫힌 뒤 열기 전 포커스로 복원할지 여부입니다.
 * @param scrollLock - body scroll lock 적용 여부입니다.
 * @param title - 모달 제목입니다.
 *
 * @example
 * ```tsx
 * <ConfirmModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="해당 자기소개서를 저장하시겠습니까?"
 *   description="버전 V.0.1로 저장됩니다."
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function ConfirmModal({
  cancelLabel = '취소',
  closeOnEscape = true,
  closeOnOutsideClick = true,
  confirmLabel = '확인',
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  title,
  ...surfaceProps
}: ConfirmModalProps) {
  const generatedId = useId();
  const titleId = `confirm-modal-title-${generatedId}`;
  const descriptionId = description ? `confirm-modal-description-${generatedId}` : undefined;

  return (
    <Surface
      {...surfaceProps}
      canClose={!isLoading}
      closeOnEscape={!isLoading && closeOnEscape}
      closeOnOutsideClick={!isLoading && closeOnOutsideClick}
      variant="modal"
    >
      <Surface.Portal>
        <Surface.Overlay />
        <Surface.Content
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className="w-80 items-center gap-8 bg-gray-800 p-6 text-center"
        >
          <Surface.Header className="flex flex-col items-center gap-3">
            <Title as="h2" className="body-18 font-bold" id={titleId}>
              {title}
            </Title>
            {description ? (
              <p className="m-0 body-14 font-medium text-gray-100" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </Surface.Header>
          <Surface.Footer className="grid w-full grid-cols-2 gap-2">
            <Surface.Close aria-label={cancelLabel} asChild>
              <Button
                className="h-10 w-full"
                disabled={isLoading}
                onClick={onCancel}
                size="sm"
                variant="secondary"
              >
                {cancelLabel}
              </Button>
            </Surface.Close>
            <Button
              className="h-10 w-full"
              isLoading={isLoading}
              onClick={onConfirm}
              size="sm"
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

export type { ConfirmModalProps };
