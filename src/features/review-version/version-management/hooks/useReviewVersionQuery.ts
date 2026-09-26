'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ReviewVersionSummary } from '@/entities/review-version';

import { isSelectableReviewVersion } from '../utils/reviewVersion';

interface UseReviewVersionQueryParams {
  fallbackVersionId: string;
  versions: ReviewVersionSummary[];
}

const VERSION_QUERY_KEY = 'versionId';

const getRequestedVersionId = () =>
  new URL(window.location.href).searchParams.get(VERSION_QUERY_KEY);

const replaceVersionQuery = (versionId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(VERSION_QUERY_KEY, versionId);
  window.history.replaceState(window.history.state, '', url);
};

/** 선택 버전을 URL 쿼리와 양방향으로 동기화합니다. */
export function useReviewVersionQuery({
  fallbackVersionId,
  versions,
}: UseReviewVersionQueryParams) {
  const [selectedVersionId, setSelectedVersionId] = useState(fallbackVersionId);

  const selectVersion = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    replaceVersionQuery(versionId);
  }, []);

  useEffect(() => {
    const syncVersionFromUrl = () => {
      const requestedVersionId = getRequestedVersionId();
      const nextVersionId = isSelectableReviewVersion(versions, requestedVersionId)
        ? requestedVersionId
        : fallbackVersionId;

      setSelectedVersionId(nextVersionId);

      if (requestedVersionId !== nextVersionId) {
        replaceVersionQuery(nextVersionId);
      }
    };

    syncVersionFromUrl();
    window.addEventListener('popstate', syncVersionFromUrl);

    return () => window.removeEventListener('popstate', syncVersionFromUrl);
  }, [fallbackVersionId, versions]);

  return { selectedVersionId, selectVersion };
}
