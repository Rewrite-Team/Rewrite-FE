import { cva } from 'class-variance-authority';

import type { CoverLetterDisplayStatus } from '@/entities/cover-letter/model/types';

interface CoverLetterStatusProps {
  displayStatus: CoverLetterDisplayStatus;
}

const coverLetterStatusVariants = cva(
  'inline-flex min-w-0 items-center rounded-full border px-2.5 py-1 font-medium transition-colors',
  {
    variants: {
      status: {
        WRITING: 'border-gray-300 bg-white/75 text-gray-700',
        REVIEWING: 'border-primary-300 bg-primary-50/80 text-gray-700',
        REVIEWED: 'border-success-500/65 bg-white/90 text-success-500 font-semibold',
        REVIEW_FAILED: 'border-error-500/40 bg-white/75 text-error-500',
      },
    },
  }
);

const DISPLAY_STATUS_LABEL: Record<CoverLetterDisplayStatus, string> = {
  WRITING: '작성 중',
  REVIEWING: '첨삭 중',
  REVIEWED: '첨삭 완료',
  REVIEW_FAILED: '첨삭 실패',
};

/** 자기소개서의 첨삭 상태를 상태별 색상과 한글 문구로 표시합니다. */
export function CoverLetterStatus({ displayStatus }: CoverLetterStatusProps) {
  return (
    <span className={coverLetterStatusVariants({ status: displayStatus })}>
      <span className="truncate">{DISPLAY_STATUS_LABEL[displayStatus]}</span>
    </span>
  );
}
