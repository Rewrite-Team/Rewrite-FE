import type { ComponentProps, ReactNode } from 'react';

import type { Button } from '@/shared/ui/button';
import type { SurfaceCloseMeta, SurfaceOpenChangeMeta } from '@/shared/ui/surface';

type ConfirmModalButtonProps = Omit<
  ComponentProps<typeof Button>,
  'aria-label' | 'children' | 'disabled' | 'iconOnly' | 'isLoading' | 'onClick'
>;

/**
 * `ConfirmModal` 컴포넌트 props입니다.
 *
 * @param cancelLabel - 모달 하단에 표시할 취소 버튼 문구입니다.
 * @param cancelButtonProps - 취소 버튼에 추가로 전달할 버튼 스타일 props입니다.
 * @param className - 모달 컨테이너 스타일을 확장할 클래스입니다.
 * @param closeOnEscape - ESC 키로 닫을 수 있는지 여부입니다.
 * @param closeOnOutsideClick - 외부 영역 클릭으로 닫을 수 있는지 여부입니다.
 * @param confirmLabel - 모달 하단에 표시할 확인 버튼 문구입니다.
 * @param confirmButtonProps - 확인 버튼에 추가로 전달할 버튼 스타일 props입니다.
 * @param defaultOpen - uncontrolled 방식에서 최초로 열어둘지 여부입니다.
 * @param description - 제목 아래에 표시할 설명입니다.
 * @param focusTrap - 열린 동안 포커스를 Content 내부에 가둘지 여부입니다.
 * @param isLoading - 확인 작업 진행 여부입니다. true이면 중복 실행과 dismiss 닫기를 막습니다.
 * @param onCancel - 취소 버튼 클릭 시 호출됩니다.
 * @param onClosePrevented - 닫기 요청이 정책에 의해 차단됐을 때 호출됩니다.
 * @param onConfirm - 확인 버튼 클릭 시 호출됩니다.
 * @param onOpenChange - 열림 상태가 변경될 때 호출됩니다.
 * @param open - controlled 방식으로 열림 상태를 제어할 때 사용합니다.
 * @param restoreFocus - 닫힌 뒤 열기 전 포커스로 복원할지 여부입니다.
 * @param scrollLock - body scroll lock 적용 여부입니다.
 * @param title - 모달 제목입니다.
 */
interface ConfirmModalProps {
  cancelLabel?: string;
  cancelButtonProps?: ConfirmModalButtonProps;
  className?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  confirmLabel?: string;
  confirmButtonProps?: ConfirmModalButtonProps;
  defaultOpen?: boolean;
  description?: ReactNode;
  focusTrap?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
  onClosePrevented?: (meta: SurfaceCloseMeta) => void;
  onConfirm: () => void;
  onOpenChange?: (open: boolean, meta: SurfaceOpenChangeMeta) => void;
  open?: boolean;
  restoreFocus?: boolean;
  scrollLock?: boolean;
  title: ReactNode;
}

export type { ConfirmModalButtonProps, ConfirmModalProps };
