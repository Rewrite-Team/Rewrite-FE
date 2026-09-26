import { useId } from 'react';

import Link from 'next/link';

import type { CoverLetterSummary } from '@/entities/cover-letter/model/types';
import { CoverLetterStatus } from '@/entities/cover-letter/ui/CoverLetterStatus';
import { ROUTES } from '@/shared/constants/routes';
import { BadgeGroup } from '@/shared/ui/badge';
import { Title } from '@/shared/ui/title';
import { formatDate } from '@/shared/utils/formatDate';

import styles from './CoverLetterCard.module.css';

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
  const folderGradientId = useId();

  return (
    <li className="min-w-0">
      <Link
        aria-label={`${title} 자기소개서 상세 보기`}
        className={`${styles.card} focus-ring group text-white`}
        data-status={displayStatus}
        href={ROUTES.WRITING_DETAIL(id)}
      >
        <div aria-hidden="true" className={styles.paperStack}>
          <span className={styles.paperBack} />
          <span className={styles.paperMiddle} />
          <span className={styles.paperFront} />
        </div>

        <BadgeGroup
          className={`${styles.badges} min-w-0 flex-nowrap gap-0`}
          companyBadgeClassName={`${styles.folderBadge} max-w-36 truncate body-14`}
          companyName={companyName}
          jobBadgeClassName={`${styles.folderBadge} max-w-36 truncate body-14`}
          jobName={positionTitle}
        />

        <svg
          aria-hidden="true"
          className={styles.folderFront}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id={folderGradientId} x1="0" x2="1" y1="0" y2="1">
              <stop className={styles.folderFrontStart} offset="0" />
              <stop className={styles.folderFrontEnd} offset="0.72" />
            </linearGradient>
          </defs>
          <path
            d="M0 0 H42 Q44 0 45.5 2.5 L51.5 14.5 Q53 17 56 17 H100 V100 H0 Z"
            fill={`url(#${folderGradientId})`}
          />
        </svg>

        <div className={styles.content}>
          <Title
            as="h2"
            className="line-clamp-2 break-keep text-balance body-18 font-semibold"
            title={title}
          >
            {title}
          </Title>

          <div className="mt-auto flex items-center justify-between gap-4 pt-5 body-12">
            <CoverLetterStatus displayStatus={displayStatus} />
            <time className="shrink-0 text-gray-50" dateTime={createdAt}>
              {formatDate(createdAt)}
            </time>
          </div>
        </div>
      </Link>
    </li>
  );
}
