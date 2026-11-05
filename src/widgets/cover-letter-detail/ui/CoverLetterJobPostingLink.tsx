import { ExternalLinkIcon } from '@/shared/assets/icons/common';
import { LinkButton } from '@/shared/ui/button';

interface CoverLetterJobPostingLinkProps {
  href?: string | null;
}

/** 자기소개서 상세 화면에서 채용 공고를 새 탭으로 엽니다. */
export function CoverLetterJobPostingLink({ href }: CoverLetterJobPostingLinkProps) {
  if (!href) return null;

  return (
    <LinkButton
      aria-label="채용 공고 새 탭에서 열기"
      className="h-9 w-auto gap-2 px-3 body-14"
      external
      href={href}
      size="sm"
      target="_blank"
      variant="outline"
    >
      공고 보기
      <ExternalLinkIcon aria-hidden="true" className="size-4" />
    </LinkButton>
  );
}
