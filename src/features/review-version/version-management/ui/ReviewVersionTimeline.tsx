import type { ReviewVersionSummary } from '@/entities/review-version';

import { ReviewVersionItem } from './ReviewVersionItem';
import { createReviewVersionTimelineGradient } from '../utils/reviewVersionTimeline';

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
  const timelineGradient = createReviewVersionTimelineGradient(versions, selectedVersionId);

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-3 w-0.5 -translate-x-1/2"
        style={{ background: timelineGradient }}
      />
      <ol className="relative m-0 list-none p-0">
        {versions.map((version) => (
          <ReviewVersionItem
            isSelected={version.id === selectedVersionId}
            key={version.id}
            onSelect={() => onSelect(version.id)}
            version={version}
          />
        ))}
      </ol>
    </div>
  );
}
