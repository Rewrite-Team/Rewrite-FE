'use client';

import { useCoverLetterDetail } from '@/entities/cover-letter';

import { CoverLetterPageHeader } from './CoverLetterPageHeader';

interface CoverLetterMetadataHeaderProps {
  coverLetterId: string;
  showVersion?: boolean;
  className?: string;
  titleClassName?: string;
}

/** 상세 조회 API의 자기소개서 정보를 하위 기능 페이지 제목에 표시합니다. */
export function CoverLetterMetadataHeader({
  coverLetterId,
  showVersion = false,
  className,
  titleClassName,
}: CoverLetterMetadataHeaderProps) {
  const { data } = useCoverLetterDetail(coverLetterId);
  const coverLetter = data?.coverLetter;

  return (
    <CoverLetterPageHeader
      className={className}
      companyName={coverLetter?.companyName}
      positionTitle={coverLetter?.positionTitle}
      title={coverLetter?.title ?? '자기소개서'}
      titleClassName={titleClassName}
      version={showVersion ? data?.reviewVersion?.version : undefined}
    />
  );
}
