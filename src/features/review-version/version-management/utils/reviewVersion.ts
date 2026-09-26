import type { ReviewVersionSummary } from '@/entities/review-version';

export const isSelectableReviewVersion = (
  versions: ReviewVersionSummary[],
  versionId: string | null
): versionId is string =>
  versionId !== null &&
  versions.some((version) => version.id === versionId && version.status === 'COMPLETED');
