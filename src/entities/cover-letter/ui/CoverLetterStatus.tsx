import type { CoverLetterDisplayStatus } from '@/entities/cover-letter/model/types';
import { cn } from '@/shared/styles/utils/cn';
import { SymbolLogo } from '@/shared/ui/logo';

interface CoverLetterStatusProps {
  displayStatus: CoverLetterDisplayStatus;
}

interface DisplayStatusMeta {
  label: string;
  logoClassName?: string;
}

const DISPLAY_STATUS_META: Record<CoverLetterDisplayStatus, DisplayStatusMeta> = {
  WRITING: {
    label: '작성 중',
  },
  REVIEWING: {
    label: '첨삭 중',
    logoClassName: 'text-primary-300',
  },
  REVIEWED: {
    label: '첨삭 완료',
    logoClassName: 'text-success-500',
  },
  REVIEW_FAILED: {
    label: '첨삭 실패',
    logoClassName: 'text-error-500',
  },
};

const COLORED_SYMBOL_CLASS_NAME =
  '**:fill-current [&>circle:nth-of-type(n+2)]:fill-white [&>g>circle:nth-of-type(n+2)]:fill-white';

/** 자기소개서의 첨삭 상태를 상태별 심볼 색상과 한글 문구로 표시합니다. */
export function CoverLetterStatus({ displayStatus }: CoverLetterStatusProps) {
  const { label, logoClassName } = DISPLAY_STATUS_META[displayStatus];

  return (
    <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-gray-600 bg-gray-800/80 py-1 pr-2.5 pl-2 text-white transition-colors group-hover:border-gray-500 group-hover:bg-gray-800">
      <SymbolLogo
        className={cn(
          'h-3.5 w-auto shrink-0',
          logoClassName && COLORED_SYMBOL_CLASS_NAME,
          logoClassName
        )}
      />
      <span className="truncate font-medium">{label}</span>
    </span>
  );
}
