import { cva } from 'class-variance-authority';

import type { ReviewVersionStatus, ReviewVersionSummary } from '@/entities/review-version';
import { cn } from '@/shared/styles/utils/cn';
import { Spinner } from '@/shared/ui/spinner';
import { formatDateTime } from '@/shared/utils/formatDate';

interface ReviewVersionItemProps {
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  version: ReviewVersionSummary;
  verticalLineBackground: string;
}

const STATUS_LABEL: Record<Exclude<ReviewVersionStatus, 'COMPLETED'>, string> = {
  FAILED: '생성 실패',
  GENERATING: '생성 중',
} as const;

const progressVariants = cva('mt-1 flex items-center gap-1.5 body-12', {
  variants: {
    status: {
      FAILED: 'text-error-400',
      GENERATING: 'text-gray-300',
    },
  },
});

const markerColorVariants = cva('', {
  variants: {
    status: {
      COMPLETED: 'bg-gray-400',
      FAILED: 'bg-error-400',
      GENERATING: 'bg-gray-500',
    },
    selected: {
      false: null,
      true: 'bg-primary-500',
    },
  },
});

const markerCenterVariants = cva('size-1.5 rounded-full', {
  variants: {
    status: {
      COMPLETED: 'bg-white',
      FAILED: 'bg-white',
      GENERATING: 'bg-gray-100',
    },
  },
});

const connectorColorVariants = cva('', {
  variants: {
    status: {
      COMPLETED: 'bg-gray-400',
      FAILED: 'bg-error-400',
      GENERATING: 'bg-gray-400',
    },
    selected: {
      false: null,
      true: 'bg-primary-500',
    },
  },
});

const versionButtonVariants = cva(
  'focus-ring -mt-1 flex w-full flex-col items-start rounded-lg px-2 py-1 text-left transition-colors',
  {
    variants: {
      selectable: {
        false: 'cursor-not-allowed opacity-75',
        true: 'hover:bg-white/6',
      },
    },
  }
);

const versionLabelVariants = cva('body-16 font-medium', {
  variants: {
    status: {
      COMPLETED: 'text-white',
      FAILED: 'text-white',
      GENERATING: 'text-gray-100',
    },
    selected: {
      false: null,
      true: 'text-primary-300',
    },
  },
});

function VersionProgress({ status }: { status: Exclude<ReviewVersionStatus, 'COMPLETED'> }) {
  const isPending = status === 'GENERATING';

  return (
    <span className={progressVariants({ status })} role={isPending ? 'status' : undefined}>
      {isPending ? <Spinner className="size-3" /> : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ReviewVersionItem({
  isLast,
  isSelected,
  onSelect,
  version,
  verticalLineBackground,
}: ReviewVersionItemProps) {
  const isSelectable = version.status === 'COMPLETED';
  const markerColorClassName = cn(
    markerColorVariants({ selected: isSelected, status: version.status })
  );
  const connectorColorClassName = cn(
    connectorColorVariants({ selected: isSelected, status: version.status })
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
        className={cn(
          'absolute top-3.75 left-5 z-1 h-0.5 w-4.5 rounded-full',
          connectorColorClassName
        )}
      />

      <button
        aria-current={isSelected ? 'true' : undefined}
        className={versionButtonVariants({ selectable: isSelectable })}
        disabled={!isSelectable}
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(versionLabelVariants({ selected: isSelected, status: version.status }))}
        >
          {version.label}
        </span>
        <time className="mt-0.5 body-12 text-gray-200" dateTime={version.createdAt}>
          {formatDateTime(version.createdAt)}
        </time>
        {version.status === 'COMPLETED' ? null : <VersionProgress status={version.status} />}
      </button>
    </li>
  );
}
