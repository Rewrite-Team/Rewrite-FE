import type { ReviewVersionSummary } from '@/entities/review-version';

/** 목록에 존재하면서 생성이 완료된 버전인지 판정합니다. */
export const isSelectableReviewVersion = (
  versions: ReviewVersionSummary[],
  versionId: string | null
): versionId is string =>
  versionId !== null &&
  versions.some((version) => version.id === versionId && version.status === 'COMPLETED');
