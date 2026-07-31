import Link from 'next/link';

import { ROUTES } from '@/shared/constants/routes';
import { BadgeTitle } from '@/shared/ui/badge-title';
import { formatDate } from '@/shared/utils/formatDate';

import { CoverLetterStatus } from './CoverLetterStatus';

import type { CoverLetterSummary } from '../model/types';

interface CoverLetterCardProps {
  coverLetter: CoverLetterSummary;
}

/**
 * ## CoverLetterCard
 *
 * @description
 * 자기소개서 목록에서 회사, 직무, 제목, 첨삭 상태와 작성일을 요약해 보여주는 카드입니다.
 * 카드 전체가 상세 화면으로 이동하는 링크이며 키보드 포커스 상태를 제공합니다.
 */
export function CoverLetterCard({ coverLetter }: CoverLetterCardProps) {
  const { companyName, createdAt, displayStatus, id, positionTitle, title } = coverLetter;

  return (
    <li className="min-w-0">
      <Link
        aria-label={`${title} 자기소개서 상세 보기`}
        className="focus-ring group flex min-h-38.5 flex-col rounded-2xl bg-gray-700 px-6 py-5 text-white transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-gray-600"
        href={ROUTES.WRITING_DETAIL(id)}
      >
        <BadgeTitle
          badgeGroupClassName="min-w-0 flex-nowrap gap-1.5"
          className="gap-4"
          companyBadgeClassName="max-w-36 truncate"
          companyName={companyName}
          jobBadgeClassName="max-w-36 truncate"
          jobName={positionTitle}
          title={title}
          titleClassName="truncate body-16"
        />

        <div className="mt-auto flex items-center justify-between gap-4 pt-9 body-12">
          <CoverLetterStatus displayStatus={displayStatus} />
          <time className="shrink-0 text-white" dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>
      </Link>
    </li>
  );
}
