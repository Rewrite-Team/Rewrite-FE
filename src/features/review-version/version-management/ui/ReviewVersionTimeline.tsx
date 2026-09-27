import type { ReviewVersionSummary } from '@/entities/review-version';

import { ReviewVersionItem } from './ReviewVersionItem';
import { createReviewVersionSegmentGradient, getReviewVersionColor } from './reviewVersionStyles';

interface ReviewVersionTimelineProps {
  onSelect: (versionId: string) => void;
  selectedVersionId: string;
  versions: ReviewVersionSummary[];
}

/** 버전을 시간순으로 배치하고 인접한 원 사이의 상태 색상을 연결합니다. */
export function ReviewVersionTimeline({
  onSelect,
  selectedVersionId,
  versions,
}: ReviewVersionTimelineProps) {
  const latestCompletedVersionId = versions.findLast(
    (version) => version.status === 'COMPLETED'
  )?.id;

  return (
    <ol className="relative m-0 list-none p-0">
      {versions.map((version, index) => {
        const nextVersion = versions[index + 1];

        return (
          <ReviewVersionItem
            isLast={!nextVersion}
            isLatestCompleted={version.id === latestCompletedVersionId}
            isSelected={version.id === selectedVersionId}
            key={version.id}
            onSelect={() => onSelect(version.id)}
            version={version}
            verticalLineBackground={
              nextVersion
                ? createReviewVersionSegmentGradient(version, nextVersion, selectedVersionId)
                : getReviewVersionColor(version, selectedVersionId)
            }
          />
        );
      })}
    </ol>
  );
}
