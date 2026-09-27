'use client';

import { createContext, use, useCallback, useMemo, type ReactNode } from 'react';

import type { ReviewVersionSummary } from '@/entities/review-version';
import { useControllableState } from '@/shared/hooks';

import { isSelectableReviewVersion } from '../utils/reviewVersion';

interface ReviewVersionContextValue {
  editableVersionId: string;
  selectedVersionId: string;
  selectVersion: (versionId: string) => void;
  versions: ReviewVersionSummary[];
}

interface ReviewVersionProviderProps {
  children: ReactNode;
  editableVersionId: string;
  initialSelectedVersionId: string;
  onSelectedVersionChange?: (versionId: string) => void;
  selectedVersionId?: string;
  versions: ReviewVersionSummary[];
}

const ReviewVersionContext = createContext<ReviewVersionContextValue | null>(null);

/** 버전 패널과 자기소개서 본문이 같은 선택 버전을 공유하도록 상태를 제공합니다. */
export function ReviewVersionProvider({
  children,
  editableVersionId,
  initialSelectedVersionId,
  onSelectedVersionChange,
  selectedVersionId: selectedVersionIdProp,
  versions,
}: ReviewVersionProviderProps) {
  const [selectedVersionId, setSelectedVersionId] = useControllableState({
    defaultValue: initialSelectedVersionId,
    onChange: onSelectedVersionChange,
    value: selectedVersionIdProp,
  });

  const selectVersion = useCallback(
    (versionId: string) => {
      if (isSelectableReviewVersion(versions, versionId)) {
        setSelectedVersionId(versionId);
      }
    },
    [setSelectedVersionId, versions]
  );

  const value = useMemo<ReviewVersionContextValue>(
    () => ({
      editableVersionId,
      selectedVersionId,
      selectVersion,
      versions,
    }),
    [editableVersionId, selectVersion, selectedVersionId, versions]
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
