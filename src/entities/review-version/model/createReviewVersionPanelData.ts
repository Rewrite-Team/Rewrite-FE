import type { ReviewVersionSummary } from './types';
import type { ReviewVersionListItemResponse } from '../api/types';

/** API 버전 목록을 패널 표시 순서와 최초 선택 버전으로 변환합니다. */
export function createReviewVersionPanelData(items: ReviewVersionListItemResponse[]): {
  versions: ReviewVersionSummary[];
  initialSelectedVersionId: string;
} {
  const sortedVersions = [...items].sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt)
  );
  const versions: ReviewVersionSummary[] = sortedVersions.map((version) => ({
    id: version.id,
    label: version.version,
    createdAt: version.createdAt,
    status:
      version.status === 'COMPLETED'
        ? 'COMPLETED'
        : version.status === 'FAILED' || version.status === 'CANCELED'
          ? 'FAILED'
          : 'GENERATING',
  }));
  const initialSelectedVersionId =
    sortedVersions.find((version) => version.isLatestReviewed)?.id ??
    sortedVersions.findLast((version) => version.status === 'COMPLETED')?.id ??
    '';

  return { versions, initialSelectedVersionId };
}
