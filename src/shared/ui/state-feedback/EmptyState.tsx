'use client';

import { emptyLottie } from '@/shared/assets/lotties';

import { StateFeedback } from './StateFeedback';

import type { EmptyStateProps } from './StateFeedback.types';

/**
 * 조회 결과나 사용자가 만든 콘텐츠가 없을 때 기본 Empty Lottie와 다음 행동을 안내합니다.
 * 버튼은 `action`으로 설정하고 기본 Lottie는 `animationData`로 교체하거나 숨길 수 있습니다.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   action={{ label: '작성하기', onClick: handleCreate }}
 *   description="첫 자기소개서를 작성해 보세요."
 *   title="작성한 자기소개서가 없어요"
 * />
 * ```
 */
export function EmptyState({ action, animationData, ...stateProps }: EmptyStateProps) {
  const resolvedAnimationData = animationData === undefined ? emptyLottie : animationData;

  return (
    <StateFeedback
      {...stateProps}
      action={action}
      animationData={resolvedAnimationData}
      data-variant="empty"
      role="status"
    />
  );
}
