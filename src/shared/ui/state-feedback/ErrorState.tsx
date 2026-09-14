'use client';

import { errorLottie } from '@/shared/assets/lotties';

import { StateFeedback } from './StateFeedback';

import type { ErrorStateProps } from './StateFeedback.types';

/**
 * 데이터 요청이나 화면 처리에 실패했을 때 기본 Error Lottie와 재시도 행동을 안내합니다.
 * `retry`를 전달하면 기본 문구를 적용한 재시도 버튼을 표시합니다.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   description="잠시 후 다시 시도해 주세요."
 *   retry={{ onClick: handleRetry }}
 *   title="데이터를 불러오지 못했어요"
 * />
 * ```
 */
export function ErrorState({ animationData, retry, ...stateProps }: ErrorStateProps) {
  const action = retry ? { ...retry, label: retry.label ?? '다시 시도' } : undefined;
  const resolvedAnimationData = animationData === undefined ? errorLottie : animationData;

  return (
    <StateFeedback
      {...stateProps}
      action={action}
      animationData={resolvedAnimationData}
      data-variant="error"
      role="alert"
    />
  );
}
