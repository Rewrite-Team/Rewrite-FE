'use client';

import { useCoverLetterDetail } from '@/entities/cover-letter';
import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';

interface CoverLetterMetadataHeaderProps {
  coverLetterId: string;
  showVersion?: boolean;
  className?: string;
  titleClassName?: string;
  companyBadgeClassName?: string;
  jobBadgeClassName?: string;
}

/** 상세 조회 API의 자기소개서 정보를 하위 기능 페이지 제목에 표시합니다. */
export function CoverLetterMetadataHeader({
  coverLetterId,
  showVersion = false,
  className,
  titleClassName,
  companyBadgeClassName,
  jobBadgeClassName,
}: CoverLetterMetadataHeaderProps) {
  const { data } = useCoverLetterDetail(coverLetterId);
  const coverLetter = data?.coverLetter;

  return (
    <PageHeader
      className={className}
      eyebrow={
        <BadgeGroup
          companyName={coverLetter?.companyName}
          jobName={coverLetter?.positionTitle}
          companyBadgeClassName={companyBadgeClassName}
          jobBadgeClassName={jobBadgeClassName}
        />
      }
      title={coverLetter?.title ?? '자기소개서'}
      titleClassName={titleClassName}
      version={showVersion ? data?.reviewVersion?.version : undefined}
    />
  );
}
