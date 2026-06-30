import type { ReactNode } from 'react';

import type { SurfaceCloseMeta, SurfaceOpenChangeMeta } from '@/shared/ui/surface';

/**
 * AI 첨삭 요구사항 모달 props입니다.
 *
 * @remarks
 * 모달 열림 상태와 textarea 입력값은 각각 controlled/uncontrolled 방식을 지원합니다.
 * 재첨삭 요청 실행 자체는 이 컴포넌트가 처리하지 않고 `onConfirm`으로 현재 요구사항을 전달합니다.
 */
export interface AIReviewRequirementModalProps {
  /**
   * ESC 키로 모달을 닫을 수 있는지 여부입니다.
   *
   * 입력 중이거나 `isLoading`이면 이 값이 `true`여도 ESC 닫기는 차단됩니다.
   *
   * @defaultValue `true`
   */
  closeOnEscape?: boolean;

  /**
   * 모달 바깥 영역 클릭으로 닫을 수 있는지 여부입니다.
   *
   * 입력 중이거나 `isLoading`이면 이 값이 `true`여도 외부 클릭 닫기는 차단됩니다.
   *
   * @defaultValue `true`
   */
  closeOnOutsideClick?: boolean;

  /**
   * 하단 CTA 버튼에 표시할 문구입니다.
   *
   * @defaultValue `'AI 첨삭 다시 받기'`
   */
  confirmLabel?: string;

  /**
   * uncontrolled 방식에서 textarea에 최초로 입력해 둘 첨삭 요구사항입니다.
   *
   * @defaultValue `''`
   */
  defaultValue?: string;

  /**
   * uncontrolled 방식에서 모달을 최초로 열어둘지 여부입니다.
   *
   * @defaultValue `false`
   */
  defaultOpen?: boolean;

  /**
   * 모달이 열린 동안 키보드 포커스를 모달 내부에 가둘지 여부입니다.
   *
   * @defaultValue `true`
   */
  focusTrap?: boolean;

  /**
   * AI 첨삭 재요청 작업이 진행 중인지 여부입니다.
   *
   * `true`이면 CTA 버튼에 로딩 상태를 표시하고 ESC/외부 클릭/닫기 버튼으로 닫히지 않도록 막습니다.
   *
   * @defaultValue `false`
   */
  isLoading?: boolean;

  /**
   * textarea에 입력할 수 있는 최대 글자 수입니다.
   *
   * @defaultValue `INPUT_LIMITS.AI_REVIEW_REQUIREMENT`
   */
  maxLength?: number;

  /**
   * 닫기 요청이 현재 정책에 의해 차단됐을 때 호출됩니다.
   *
   * 예를 들어 `isLoading` 중 ESC나 외부 클릭으로 닫기를 시도하면 이 콜백으로 이유를 받을 수 있습니다.
   */
  onClosePrevented?: (meta: SurfaceCloseMeta) => void;

  /**
   * 하단 CTA 버튼을 클릭했을 때 현재 textarea 값과 함께 호출됩니다.
   *
   * 이 콜백에서 AI 첨삭 재요청 API 호출이나 상위 feature 액션을 실행합니다.
   */
  onConfirm: (value: string) => void;

  /**
   * 모달 열림 상태가 변경될 때 호출됩니다.
   *
   * `open`을 함께 전달하면 controlled modal로 사용할 수 있습니다.
   */
  onOpenChange?: (open: boolean, meta: SurfaceOpenChangeMeta) => void;

  /**
   * textarea의 첨삭 요구사항 값이 변경될 때 호출됩니다.
   *
   * `value`를 함께 전달하면 controlled textarea로 사용할 수 있습니다.
   */
  onValueChange?: (value: string) => void;

  /** controlled 방식으로 모달 열림 상태를 제어할 때 사용합니다. */
  open?: boolean;

  /**
   * textarea에 표시할 placeholder입니다.
   *
   * @defaultValue `'AI 첨삭에 반영할 요구사항을 입력해 주세요.'`
   */
  placeholder?: string;

  /**
   * 모달이 닫힌 뒤 열기 전 포커스가 있던 요소로 복원할지 여부입니다.
   *
   * @defaultValue `true`
   */
  restoreFocus?: boolean;

  /**
   * 모달이 열린 동안 body scroll lock을 적용할지 여부입니다.
   *
   * @defaultValue `true`
   */
  scrollLock?: boolean;

  /**
   * 모달 상단 제목입니다.
   *
   * @defaultValue `'AI 첨삭 요구사항'`
   */
  title?: ReactNode;

  /**
   * 첨삭 요구사항 textarea 비활성화 여부입니다.
   *
   * @defaultValue `false`
   */
  textareaDisabled?: boolean;

  /** controlled 방식으로 textarea의 첨삭 요구사항 값을 제어할 때 사용합니다. */
  value?: string;
}
