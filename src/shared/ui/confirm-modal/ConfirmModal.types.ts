import type { ReactNode } from 'react';

import type { SurfaceCloseMeta, SurfaceOpenChangeMeta } from '@/shared/ui/surface';

/** ConfirmModal props입니다. */
interface ConfirmModalProps {
  /** 모달 하단에 표시할 취소 버튼 문구입니다. */
  cancelLabel?: string;
  /** ESC 키로 닫을 수 있는지 여부입니다. */
  closeOnEscape?: boolean;
  /** 외부 영역 클릭으로 닫을 수 있는지 여부입니다. */
  closeOnOutsideClick?: boolean;
  /** 모달 하단에 표시할 확인 버튼 문구입니다. */
  confirmLabel?: string;
  /** uncontrolled 방식에서 최초로 열어둘지 여부입니다. */
  defaultOpen?: boolean;
  /** 제목 아래에 표시할 짧은 설명 문구입니다. */
  description?: string;
  /** 열린 동안 포커스를 Content 내부에 가둘지 여부입니다. */
  focusTrap?: boolean;
  /** 확인 작업 진행 여부입니다. true이면 확인 버튼 로딩 표시와 dismiss 닫기 방지를 적용합니다. */
  isLoading?: boolean;
  /** 취소 버튼 클릭 시 호출됩니다. */
  onCancel?: () => void;
  /** 닫기 요청이 정책에 의해 차단됐을 때 호출됩니다. */
  onClosePrevented?: (meta: SurfaceCloseMeta) => void;
  /** 확인 버튼 클릭 시 호출됩니다. */
  onConfirm: () => void;
  /** 열림 상태가 변경될 때 호출됩니다. */
  onOpenChange?: (open: boolean, meta: SurfaceOpenChangeMeta) => void;
  /** controlled 방식으로 열림 상태를 제어할 때 사용합니다. */
  open?: boolean;
  /** 닫힌 뒤 열기 전 포커스로 복원할지 여부입니다. */
  restoreFocus?: boolean;
  /** body scroll lock 적용 여부입니다. */
  scrollLock?: boolean;
  /** 모달 제목입니다. */
  title: ReactNode;
}

export type { ConfirmModalProps };
