import type { ReviewVersionStatus, ReviewVersionSummary } from '@/entities/review-version';

const SELECTED_VERSION_COLOR = 'var(--color-primary-500)';

const VERSION_STATUS_COLOR: Record<ReviewVersionStatus, string> = {
  COMPLETED: 'var(--color-gray-400)',
  FAILED: 'var(--color-error-400)',
  GENERATING: 'var(--color-gray-400)',
};

export const getReviewVersionColor = (version: ReviewVersionSummary, selectedVersionId: string) => {
  return version.id === selectedVersionId
    ? SELECTED_VERSION_COLOR
    : VERSION_STATUS_COLOR[version.status];
};

export const createReviewVersionSegmentGradient = (
  currentVersion: ReviewVersionSummary,
  nextVersion: ReviewVersionSummary,
  selectedVersionId: string
) =>
  `linear-gradient(to bottom, ${getReviewVersionColor(currentVersion, selectedVersionId)}, ${getReviewVersionColor(nextVersion, selectedVersionId)})`;
