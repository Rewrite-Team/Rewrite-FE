import Link from 'next/link';

import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';
import { Badge } from '@/shared/ui/badge';
import { SymbolLogo } from '@/shared/ui/logo';
import { Title } from '@/shared/ui/title';
import { formatDate } from '@/shared/utils/formatDate';

import type { CoverLetterDisplayStatus, CoverLetterSummary } from '../model/types';

interface CoverLetterCardProps {
  coverLetter: CoverLetterSummary;
}

const REVIEW_STATUS: Record<CoverLetterDisplayStatus, { label: string; logoClassName?: string }> = {
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

/**
 * ## CoverLetterCard
 *
 * @description
 * 자기소개서 목록에서 회사, 직무, 제목, 첨삭 상태와 수정일을 요약해 보여주는 카드입니다.
 * 카드 전체가 상세 화면으로 이동하는 링크이며 키보드 포커스 상태를 제공합니다.
 */
export function CoverLetterCard({ coverLetter }: CoverLetterCardProps) {
  const { companyName, createdAt, displayStatus, id, positionTitle, title } = coverLetter;
  const status = REVIEW_STATUS[displayStatus];

  return (
    <li className="min-w-0">
      <Link
        aria-label={`${title} 자기소개서 상세 보기`}
        className="focus-ring group flex min-h-38.5 flex-col rounded-2xl bg-gray-700 px-6 py-5 text-white transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-gray-600"
        href={ROUTES.WRITING_DETAIL(id)}
      >
        <ul aria-label="지원 정보" className="flex min-w-0 items-center gap-1.5">
          <li className="min-w-0">
            <Badge className="max-w-36 truncate" variant="company">
              {companyName}
            </Badge>
          </li>
          <li className="min-w-0">
            <Badge className="max-w-36 truncate" variant="job">
              {positionTitle}
            </Badge>
          </li>
        </ul>

        <Title as="h2" className="mt-4 truncate body-16" title={title}>
          {title}
        </Title>

        <div className="mt-auto flex items-center justify-between gap-4 pt-9 body-12">
          <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-gray-600 bg-gray-800/80 py-1 pr-2.5 pl-2 text-white transition-colors group-hover:border-gray-500 group-hover:bg-gray-800">
            <SymbolLogo
              className={cn(
                'h-3.5 w-auto shrink-0',
                status.logoClassName &&
                  '**:fill-current [&>circle:nth-of-type(n+2)]:fill-white [&>g>circle:nth-of-type(n+2)]:fill-white',
                status.logoClassName
              )}
            />
            <span className="truncate font-medium">{status.label}</span>
          </span>
          <time className="shrink-0 text-white" dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>
      </Link>
    </li>
  );
}
