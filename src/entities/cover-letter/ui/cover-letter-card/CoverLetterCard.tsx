import { useId } from 'react';

import Link from 'next/link';

import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';
import { BadgeGroup } from '@/shared/ui/badge';
import { Title } from '@/shared/ui/title';
import { formatDate } from '@/shared/utils/formatDate';

import styles from './CoverLetterCard.module.css';
import { CoverLetterStatus } from '../CoverLetterStatus';

import type { CoverLetterListItemResponse } from '../../api/types';

interface CoverLetterCardProps {
  coverLetter: CoverLetterListItemResponse;
}

/**
 * ## CoverLetterCard
 *
 * @description
 * 자기소개서 목록에서 회사, 직무, 제목, 첨삭 상태와 작성일을 요약해 보여주는 카드입니다.
 * 작성 중인 카드는 작성 화면으로, 그 외 상태는 상세 화면으로 연결합니다.
 */
export function CoverLetterCard({ coverLetter }: CoverLetterCardProps) {
  const { companyName, createdAt, displayStatus, id, positionTitle } = coverLetter;
  const title = coverLetter.title?.trim() || '제목 없는 자기소개서';
  const isWriting = displayStatus === 'WRITING';
  const folderGradientId = useId();

  return (
    <li className="min-w-0">
      <Link
        aria-label={`${title} 자기소개서 ${isWriting ? '이어서 작성' : '상세 보기'}`}
        className={cn(styles.card, 'focus-ring group text-white')}
        data-status={displayStatus}
        href={isWriting ? ROUTES.WRITING_CREATE_STEP(id, 1) : ROUTES.WRITING_DETAIL(id)}
      >
        <div aria-hidden="true" className={styles.paperStack}>
          <span className={styles.paperBack} />
          <span className={styles.paperMiddle} />
          <span className={styles.paperFront} />
        </div>

        <BadgeGroup
          className={cn(styles.badges, 'min-w-0 flex-nowrap gap-0')}
          companyBadgeClassName={cn(styles.folderBadge, 'max-w-36 truncate body-14')}
          companyName={companyName?.trim() || '회사 미입력'}
          jobBadgeClassName={cn(styles.folderBadge, 'max-w-36 truncate body-14')}
          jobName={positionTitle?.trim() || '직무 미입력'}
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
