import type { ReviewVersionSummary } from '@/entities/review-version';

import { ReviewVersionItem } from './ReviewVersionItem';
import {
  createReviewVersionSegmentGradient,
  getReviewVersionColor,
} from '../utils/reviewVersionTimeline';

interface ReviewVersionTimelineProps {
  onSelect: (versionId: string) => void;
  selectedVersionId: string;
  versions: ReviewVersionSummary[];
}

export function ReviewVersionTimeline({
  onSelect,
  selectedVersionId,
  versions,
}: ReviewVersionTimelineProps) {
  return (
    <ol className="relative m-0 list-none p-0">
      {versions.map((version, index) => {
        const nextVersion = versions[index + 1];

        return (
          <ReviewVersionItem
            isLast={!nextVersion}
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
