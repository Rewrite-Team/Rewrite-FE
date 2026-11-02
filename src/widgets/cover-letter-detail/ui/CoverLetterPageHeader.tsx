import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterJobPostingLink } from './CoverLetterJobPostingLink';

interface CoverLetterPageHeaderProps {
  companyName?: string | null;
  description?: string;
  jobPostingUrl?: string | null;
  positionTitle?: string | null;
  title: string;
  className?: string;
  titleClassName?: string;
  version?: string;
}

/** 자기소개서 제목, 회사·직무 배지, 공고 링크를 공통 헤더로 표시합니다. */
export function CoverLetterPageHeader({
  companyName,
  description,
  jobPostingUrl,
  positionTitle,
  title,
  className,
  titleClassName,
  version,
}: CoverLetterPageHeaderProps) {
  return (
    <PageHeader
      className={className}
      description={description}
      eyebrow={<BadgeGroup companyName={companyName} jobName={positionTitle} />}
      title={title}
      titleAddon={jobPostingUrl ? <CoverLetterJobPostingLink href={jobPostingUrl} /> : undefined}
      titleClassName={titleClassName}
      version={version}
    />
  );
}
