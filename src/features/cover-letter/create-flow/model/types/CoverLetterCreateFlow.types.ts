import type { WritingCreateStep } from '@/shared/constants/routes';

/** 자기소개서 등록 플로우에서 화면에 제공하는 진행 상태와 이동 액션입니다. */
export interface CoverLetterCreateFlowContextValue {
  /** 사용자가 완료한 가장 높은 STEP입니다. 완료 이력이 없으면 `null`입니다. */
  highestCompletedStep: WritingCreateStep | null;
  /** 현재 라우트의 STEP을 사용자가 열 수 있는지 여부입니다. */
  isCurrentStepAccessible: boolean;
  /** 현재 STEP을 완료 처리하고 다음 STEP으로 이동합니다. */
  navigateNext: () => void;
  /** 이미 완료한 STEP 중 선택한 STEP으로 이동합니다. */
  navigateToStep: (targetStep: WritingCreateStep) => void;
}
