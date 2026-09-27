import { cva } from 'class-variance-authority';

import type { ReviewVersionStatus, ReviewVersionSummary } from '@/entities/review-version';

const SELECTED_VERSION_COLOR = 'var(--color-primary-500)';

const VERSION_STATUS_COLOR: Record<ReviewVersionStatus, string> = {
  COMPLETED: 'var(--color-gray-400)',
  FAILED: 'var(--color-error-400)',
  GENERATING: 'var(--color-gray-400)',
};

export const progressVariants = cva('mt-1 flex items-center gap-1.5 body-12', {
  variants: {
    status: {
      FAILED: 'text-error-400',
      GENERATING: 'text-gray-300',
    },
  },
});

export const markerVariants = cva('', {
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

export const markerCenterVariants = cva('size-1.5 rounded-full', {
  variants: {
    status: {
      COMPLETED: 'bg-white',
      FAILED: 'bg-white',
      GENERATING: 'bg-gray-100',
    },
  },
});

export const connectorVariants = cva('', {
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

export const versionActionVariants = cva(
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

export const versionLabelVariants = cva('body-16 font-medium', {
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

/** 선택 여부와 생성 상태에 대응하는 타임라인 색상 토큰을 반환합니다. */
export const getReviewVersionColor = (version: ReviewVersionSummary, selectedVersionId: string) => {
  return version.id === selectedVersionId
    ? SELECTED_VERSION_COLOR
    : VERSION_STATUS_COLOR[version.status];
};

/** 인접한 두 버전 원의 색상을 잇는 세로선 그라데이션을 생성합니다. */
export const createReviewVersionSegmentGradient = (
  currentVersion: ReviewVersionSummary,
  nextVersion: ReviewVersionSummary,
  selectedVersionId: string
) =>
  `linear-gradient(to bottom, ${getReviewVersionColor(currentVersion, selectedVersionId)}, ${getReviewVersionColor(nextVersion, selectedVersionId)})`;
