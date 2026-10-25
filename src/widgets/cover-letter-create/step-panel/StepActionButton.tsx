import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import type { StepPanelAction } from './types';

interface StepActionButtonProps {
  action: StepPanelAction;
  children: ReactNode;
  className: string;
  variant?: 'primary' | 'secondary';
  intent?: 'next' | 'save-draft';
}

/**
 * STEP 패널의 액션 상태를 공통 `Button` UI에 연결합니다.
 * 로딩 액션에는 공통 버튼의 스피너를 표시하고, 비활성·로딩 액션의 클릭을 막습니다.
 *
 * @param action - 버튼의 활성 상태와 클릭 액션
 * @param children - 버튼 라벨
 * @param className - 버튼에 추가할 스타일 클래스
 * @param variant - 공통 버튼의 시각적 변형
 */
export function StepActionButton({
  action,
  children,
  className,
  variant,
  intent = 'next',
}: StepActionButtonProps) {
  const isEnabled = action.status === 'enabled';

  return (
    <Button
      className={className}
      disabled={!isEnabled}
      isLoading={action.status === 'loading'}
      form={COVER_LETTER_STEP_FORM_ID}
      name="intent"
      value={intent}
      onClick={isEnabled ? action.onClick : undefined}
      type="submit"
      variant={variant}
    >
      {children}
    </Button>
  );
}
