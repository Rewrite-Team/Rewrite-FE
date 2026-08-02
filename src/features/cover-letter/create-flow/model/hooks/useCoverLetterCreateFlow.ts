'use client';

import { use } from 'react';

import { CoverLetterCreateFlowContext } from '../CoverLetterCreateFlowContext';

/**
 * 현재 자기소개서 등록 플로우의 진행 상태와 이동 액션을 반환합니다.
 *
 * @throws `CoverLetterCreateFlowProvider` 외부에서 호출하면 오류가 발생합니다.
 */
export function useCoverLetterCreateFlow() {
  const context = use(CoverLetterCreateFlowContext);

  if (!context) {
    throw new Error('useCoverLetterCreateFlow must be used within CoverLetterCreateFlowProvider.');
  }

  return context;
}
