'use client';

import { useCallback, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import type { ReviewVersionSummary } from '@/entities/review-version';

import { isSelectableReviewVersion } from '../utils/reviewVersion';

interface UseReviewVersionQueryParams {
  fallbackVersionId: string;
  versions: ReviewVersionSummary[];
}

const VERSION_QUERY_KEY = 'versionId';

const replaceVersionQuery = (versionId: string) => {
  const url = new URL(window.location.href);

  if (versionId) {
    url.searchParams.set(VERSION_QUERY_KEY, versionId);
  } else {
    url.searchParams.delete(VERSION_QUERY_KEY);
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

/** 선택 버전을 URL 쿼리와 양방향으로 동기화합니다. */
export function useReviewVersionQuery({
  fallbackVersionId,
  versions,
}: UseReviewVersionQueryParams) {
  const searchParams = useSearchParams();
  const requestedVersionId = searchParams.get(VERSION_QUERY_KEY);
  const requestedVersionKey = requestedVersionId ?? '';
  const selectedVersionId = isSelectableReviewVersion(versions, requestedVersionId)
    ? requestedVersionId
    : fallbackVersionId;

  const selectVersion = useCallback((versionId: string) => {
    replaceVersionQuery(versionId);
  }, []);

  useEffect(() => {
    if (requestedVersionKey !== selectedVersionId) {
      replaceVersionQuery(selectedVersionId);
    }
  }, [requestedVersionKey, selectedVersionId]);

  return { selectedVersionId, selectVersion };
}
