import type { WritingCreateStep } from '@/shared/constants/routes';

import { COVER_LETTER_CREATE_STEP_FLOW } from '../constants/coverLetterCreateStepFlow';

const CREATE_PROGRESS_STORAGE_KEY = 'cover-letter-create:highest-completed-step';
const progressListeners = new Set<() => void>();

const isWritingCreateStep = (value: number): value is WritingCreateStep => value >= 1 && value <= 4;

/**
 * 완료한 마지막 STEP을 기준으로 현재 접근할 수 있는 가장 높은 STEP을 반환합니다.
 *
 * @param highestCompletedStep - 사용자가 완료한 가장 높은 STEP
 * @returns 완료 이력이 없으면 STEP1, 있으면 다음 STEP 또는 마지막 STEP
 */
export const getAccessibleCoverLetterCreateStep = (
  highestCompletedStep: WritingCreateStep | null
): WritingCreateStep => {
  if (highestCompletedStep === null) return 1;

  return COVER_LETTER_CREATE_STEP_FLOW[highestCompletedStep].nextStep ?? highestCompletedStep;
};

/**
 * 현재 브라우저 세션에 저장된 마지막 완료 STEP을 반환합니다.
 * 저장값이 없거나 유효한 STEP이 아니면 `null`을 반환합니다.
 */
export const getStoredCompletedStep = (): WritingCreateStep | null => {
  // TODO: coverLetterId가 생기면 세션 값 대신 서버의 WRITING 진행 스냅샷으로 교체한다.
  const storedStep = Number(sessionStorage.getItem(CREATE_PROGRESS_STORAGE_KEY));

  return isWritingCreateStep(storedStep) ? storedStep : null;
};

/**
 * 자기소개서 등록 진행 상태 변경을 구독합니다.
 *
 * @param listener - 진행 상태가 변경될 때 실행할 함수
 * @returns 구독과 브라우저 이벤트 리스너를 해제하는 함수
 */
export const subscribeToCoverLetterCreateProgress = (listener: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CREATE_PROGRESS_STORAGE_KEY) listener();
  };

  progressListeners.add(listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    progressListeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
};

/**
 * 마지막 완료 STEP을 현재 브라우저 세션에 저장하고 구독자에게 변경을 알립니다.
 *
 * @param step - 새로 저장할 마지막 완료 STEP
 */
export const setStoredCompletedStep = (step: WritingCreateStep) => {
  sessionStorage.setItem(CREATE_PROGRESS_STORAGE_KEY, String(step));
  progressListeners.forEach((listener) => listener());
};
