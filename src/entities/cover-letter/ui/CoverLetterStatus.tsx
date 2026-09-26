import type { CoverLetterDisplayStatus } from '@/entities/cover-letter/model/types';
import { cn } from '@/shared/styles/utils/cn';

interface CoverLetterStatusProps {
  displayStatus: CoverLetterDisplayStatus;
}

interface DisplayStatusMeta {
  className: string;
  label: string;
}

const DISPLAY_STATUS_META: Record<CoverLetterDisplayStatus, DisplayStatusMeta> = {
  WRITING: {
    className: 'border-gray-300 bg-white/75 text-gray-700',
    label: '작성 중',
  },
  REVIEWING: {
    className: 'border-primary-300 bg-primary-50/80 text-primary-700',
    label: '첨삭 중',
  },
  REVIEWED: {
    className: 'border-success-500/65 bg-white/90 text-success-500 font-semibold',
    label: '첨삭 완료',
  },
  REVIEW_FAILED: {
    className: 'border-error-500/40 bg-white/75 text-error-500',
    label: '첨삭 실패',
  },
};

/** 자기소개서의 첨삭 상태를 상태별 색상과 한글 문구로 표시합니다. */
export function CoverLetterStatus({ displayStatus }: CoverLetterStatusProps) {
  const { className, label } = DISPLAY_STATUS_META[displayStatus];

  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-center rounded-full border px-2.5 py-1 font-medium transition-colors',
        className
      )}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
