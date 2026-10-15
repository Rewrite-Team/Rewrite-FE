'use client';

import { createContext, use, useCallback, useMemo, type ReactNode } from 'react';

import type { ReviewVersionSummary } from '@/entities/review-version';

import { isSelectableReviewVersion } from '../utils/reviewVersion';

interface ReviewVersionContextValue {
  selectedVersionId: string;
  selectVersion: (versionId: string) => void;
  versions: ReviewVersionSummary[];
}

interface ReviewVersionProviderProps {
  children: ReactNode;
  onSelectedVersionChange: (versionId: string) => void;
  selectedVersionId: string;
  versions: ReviewVersionSummary[];
}

const ReviewVersionContext = createContext<ReviewVersionContextValue | null>(null);

/**
 * URL에서 결정한 선택 버전과 선택 요청 콜백을 패널·본문에 공유합니다.
 * 선택 요청 시 내부 상태를 변경하지 않으며, 호출부가 조회 성공 후 URL과 prop을 갱신합니다.
 */
export function ReviewVersionProvider({
  children,
  onSelectedVersionChange,
  selectedVersionId,
  versions,
}: ReviewVersionProviderProps) {
  const selectVersion = useCallback(
    (versionId: string) => {
      if (isSelectableReviewVersion(versions, versionId)) {
        onSelectedVersionChange(versionId);
      }
    },
    [onSelectedVersionChange, versions]
  );

  const value = useMemo<ReviewVersionContextValue>(
    () => ({
      selectedVersionId,
      selectVersion,
      versions,
    }),
    [selectVersion, selectedVersionId, versions]
  );

  return <ReviewVersionContext value={value}>{children}</ReviewVersionContext>;
}

/** 가장 가까운 Provider에서 현재 버전 선택 상태와 선택 액션을 반환합니다. */
export function useReviewVersion() {
  const context = use(ReviewVersionContext);

  if (!context) {
    throw new Error('useReviewVersion must be used within ReviewVersionProvider.');
  }

  return context;
}
