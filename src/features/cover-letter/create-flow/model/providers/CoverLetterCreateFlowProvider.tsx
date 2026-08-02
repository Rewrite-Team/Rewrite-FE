'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES, type WritingCreateStep } from '@/shared/constants/routes';

import { COVER_LETTER_CREATE_STEP_FLOW } from '../constants/coverLetterCreateStepFlow';
import { CoverLetterCreateFlowContext } from '../CoverLetterCreateFlowContext';
import {
  getAccessibleCoverLetterCreateStep,
  getStoredCompletedStep,
  setStoredCompletedStep,
  subscribeToCoverLetterCreateProgress,
} from '../utils/coverLetterCreateProgress';

import type { CoverLetterCreateFlowContextValue } from '../types/CoverLetterCreateFlow.types';

interface CoverLetterCreateFlowProviderProps {
  children: ReactNode;
  currentStep: WritingCreateStep;
}

/**
 * 자기소개서 등록 과정의 접근 가능한 STEP과 화면 이동을 관리합니다.
 * 완료하지 않은 STEP에 직접 접근하면 현재 접근 가능한 첫 STEP으로 이동시킵니다.
 *
 * @param children - 등록 플로우 상태를 사용할 하위 UI
 * @param currentStep - 현재 라우트에 대응하는 STEP
 */
export function CoverLetterCreateFlowProvider({
  children,
  currentStep,
}: CoverLetterCreateFlowProviderProps) {
  const router = useRouter();
  const highestCompletedStep = useSyncExternalStore(
    subscribeToCoverLetterCreateProgress,
    getStoredCompletedStep,
    () => null
  );

  const accessibleStep = getAccessibleCoverLetterCreateStep(highestCompletedStep);
  const isCurrentStepAccessible = currentStep <= accessibleStep;

  useEffect(() => {
    if (isCurrentStepAccessible) return;

    router.replace(ROUTES.WRITING_CREATE_STEP(accessibleStep));
  }, [accessibleStep, isCurrentStepAccessible, router]);

  const completeStep = useCallback(
    (step: WritingCreateStep) => {
      const nextCompletedStep =
        highestCompletedStep === null || step > highestCompletedStep ? step : highestCompletedStep;

      // TODO: 서버 진행 스냅샷이 연결되면 세션 저장을 제거한다.
      setStoredCompletedStep(nextCompletedStep);
    },
    [highestCompletedStep]
  );

  const navigateNext = useCallback(() => {
    const { nextStep } = COVER_LETTER_CREATE_STEP_FLOW[currentStep];
    if (nextStep === null) return;

    completeStep(currentStep);
    router.push(ROUTES.WRITING_CREATE_STEP(nextStep));
  }, [completeStep, currentStep, router]);

  const navigateToStep = useCallback(
    (targetStep: WritingCreateStep) => {
      const isCompletedStep = highestCompletedStep !== null && targetStep <= highestCompletedStep;

      if (targetStep === currentStep || !isCompletedStep) return;

      router.push(ROUTES.WRITING_CREATE_STEP(targetStep));
    },
    [currentStep, highestCompletedStep, router]
  );

  const contextValue = useMemo<CoverLetterCreateFlowContextValue>(
    () => ({
      highestCompletedStep,
      isCurrentStepAccessible,
      navigateNext,
      navigateToStep,
    }),
    [highestCompletedStep, isCurrentStepAccessible, navigateNext, navigateToStep]
  );

  return (
    <CoverLetterCreateFlowContext value={contextValue}>{children}</CoverLetterCreateFlowContext>
  );
}
