import type { ReviewVersionSummary } from '@/entities/review-version';

const VERSION_COLOR = {
  completed: 'var(--color-gray-400)',
  failed: 'var(--color-error-400)',
  generating: 'var(--color-gray-500)',
  selected: 'var(--color-primary-500)',
} as const;

const formatPercentage = (value: number) => Number(value.toFixed(4));

export const getReviewVersionColor = (version: ReviewVersionSummary, selectedVersionId: string) => {
  if (version.id === selectedVersionId) {
    return VERSION_COLOR.selected;
  }

  if (version.status === 'FAILED') {
    return VERSION_COLOR.failed;
  }

  if (version.status === 'GENERATING') {
    return VERSION_COLOR.generating;
  }

  return VERSION_COLOR.completed;
};

export const createReviewVersionTimelineGradient = (
  versions: ReviewVersionSummary[],
  selectedVersionId: string
) => {
  if (versions.length === 0) {
    return 'none';
  }

  if (versions.length === 1) {
    return getReviewVersionColor(versions[0], selectedVersionId);
  }

  const lastIndex = versions.length - 1;
  const colorStops: string[] = [];

  for (let index = 0; index < lastIndex; index += 1) {
    const currentVersion = versions[index];
    const nextVersion = versions[index + 1];
    const startPosition = formatPercentage((index / lastIndex) * 100);
    const endPosition = formatPercentage(((index + 1) / lastIndex) * 100);
    const currentColor = getReviewVersionColor(currentVersion, selectedVersionId);
    const nextColor = getReviewVersionColor(nextVersion, selectedVersionId);
    const isSelectedSegment =
      currentVersion.id === selectedVersionId || nextVersion.id === selectedVersionId;

    if (index === 0) {
      colorStops.push(`${currentColor} ${startPosition}%`);
    }

    if (isSelectedSegment) {
      colorStops.push(`${nextColor} ${endPosition}%`);
      continue;
    }

    const midpoint = formatPercentage((startPosition + endPosition) / 2);
    colorStops.push(`${currentColor} ${midpoint}%`, `${nextColor} ${midpoint}%`);

    if (index === lastIndex - 1) {
      colorStops.push(`${nextColor} ${endPosition}%`);
    }
  }

  return `linear-gradient(to bottom, ${colorStops.join(', ')})`;
};
