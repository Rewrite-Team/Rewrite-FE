import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';
import type { StepPanelAction } from '@/widgets/cover-letter-create/types/coverLetterCreate';

interface StepActionButtonProps {
  action: StepPanelAction;
  children: ReactNode;
  className: string;
  variant?: 'primary' | 'secondary';
}

/**
 * STEP 패널의 액션 상태를 공통 `Button` UI에 연결합니다.
 * 비활성 액션은 클릭 핸들러를 전달하지 않습니다.
 *
 * @param action - 버튼의 활성 상태와 클릭 액션
 * @param children - 버튼 라벨
 * @param className - 버튼에 추가할 스타일 클래스
 * @param variant - 공통 버튼의 시각적 변형
 */
export function StepActionButton({ action, children, className, variant }: StepActionButtonProps) {
  const isEnabled = action.status === 'enabled';

  return (
    <Button
      className={className}
      disabled={!isEnabled}
      form={COVER_LETTER_STEP_FORM_ID}
      onClick={isEnabled ? action.onClick : undefined}
      type="submit"
      variant={variant}
    >
      {children}
    </Button>
  );
}
