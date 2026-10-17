'use client';

import { useState } from 'react';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import { getCoverLetterCreateAvailableStep } from '../model/getCoverLetterCreateAvailableStep';

import type { WritingCreateStep } from '../model/writingCreateStep';

/**
 * ## useCoverLetterCreateProgress
 *
 * @description
 * 저장된 데이터로 진입 가능한 단계를 계산하고, 같은 자기소개서의 작성 흐름에서는
 * 이미 열린 단계가 수정·재조회로 다시 잠기지 않도록 가장 멀리 열린 단계를 유지합니다.
 * 자기소개서 ID가 바뀌면 새 데이터 기준으로 초기화하며, 화면 이탈 후에도 저장하지는 않습니다.
 *
 * @example
 * ```tsx
 * const availableStep = useCoverLetterCreateProgress(coverLetterId, draft);
 * ```
 */
export function useCoverLetterCreateProgress(
  coverLetterId: string,
  draft?: CoverLetterDetailResponse
): WritingCreateStep {
  const savedAvailableStep = draft ? getCoverLetterCreateAvailableStep(draft) : 1;
  const [progress, setProgress] = useState({ coverLetterId, availableStep: savedAvailableStep });
  const availableStep =
    progress.coverLetterId === coverLetterId && progress.availableStep > savedAvailableStep
      ? progress.availableStep
      : savedAvailableStep;

  // 이전 ID의 진행 상태가 적용되지 않도록 현재 렌더에서 조건부로 동기화합니다.
  if (progress.coverLetterId !== coverLetterId || progress.availableStep !== availableStep) {
    setProgress({ coverLetterId, availableStep });
  }

  return availableStep;
}
