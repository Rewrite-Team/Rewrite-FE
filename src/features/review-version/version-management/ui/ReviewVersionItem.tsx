import type { ReviewVersionStatus, ReviewVersionSummary } from '@/entities/review-version';
import { cn } from '@/shared/styles/utils/cn';
import { Spinner } from '@/shared/ui/spinner';
import { formatDateTime } from '@/shared/utils/formatDate';

import {
  connectorVariants,
  markerCenterVariants,
  markerVariants,
  progressVariants,
  versionActionVariants,
  versionLabelVariants,
} from './reviewVersionStyles';

interface ReviewVersionItemProps {
  isLast: boolean;
  isLatestCompleted: boolean;
  isSelected: boolean;
  onSelect: () => void;
  version: ReviewVersionSummary;
  verticalLineBackground: string;
}

const STATUS_LABEL: Record<Exclude<ReviewVersionStatus, 'COMPLETED'>, string> = {
  FAILED: '생성 실패',
  GENERATING: '생성 중',
} as const;

function VersionProgress({ status }: { status: Exclude<ReviewVersionStatus, 'COMPLETED'> }) {
  const isPending = status === 'GENERATING';

  return (
    <span className={progressVariants({ status })} role={isPending ? 'status' : undefined}>
      {isPending ? <Spinner className="size-3" /> : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

/** 최신 버전임을 나타내는 뱃지 컴포넌트입니다. */
function LatestVersionBadge() {
  return <span className="rounded-full bg-gray-600 px-2 py-0.5 body-12 text-gray-100">최신</span>;
}

/** 타임라인의 버전 상태, 선택 여부, 최신 표시와 선택 액션을 렌더링합니다. */
export function ReviewVersionItem({
  isLast,
  isLatestCompleted,
  isSelected,
  onSelect,
  version,
  verticalLineBackground,
}: ReviewVersionItemProps) {
  const isSelectable = version.status === 'COMPLETED';
  const markerColorClassName = cn(markerVariants({ selected: isSelected, status: version.status }));
  const connectorClassName = cn(
    connectorVariants({ selected: isSelected, status: version.status })
  );

  return (
    <li className="relative min-h-18 pl-9 last:min-h-0">
      <span
        aria-hidden="true"
        className={cn('absolute top-4 left-3 w-0.5 -translate-x-1/2', isLast ? 'bottom-0' : 'h-18')}
        style={{ background: verticalLineBackground }}
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-2 left-1 z-1 flex size-4 items-center justify-center rounded-full',
          markerColorClassName
        )}
      >
        <span className={markerCenterVariants({ status: version.status })} />
      </span>
      <span
        aria-hidden="true"
        className={cn('absolute top-3.75 left-5 z-1 h-0.5 w-4.5 rounded-full', connectorClassName)}
      />

      <button
        aria-current={isSelected ? 'true' : undefined}
        className={versionActionVariants({ selectable: isSelectable })}
        disabled={!isSelectable}
        onClick={onSelect}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(versionLabelVariants({ selected: isSelected, status: version.status }))}
          >
            {version.label}
          </span>
          {isLatestCompleted ? <LatestVersionBadge /> : null}
        </span>
        <time className="mt-0.5 body-12 text-gray-200" dateTime={version.createdAt}>
          {formatDateTime(version.createdAt)}
        </time>
        {version.status === 'COMPLETED' ? null : <VersionProgress status={version.status} />}
      </button>
    </li>
  );
}
