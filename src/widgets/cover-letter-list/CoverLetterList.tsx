import { CoverLetterCard } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';
import {
  MOCK_COVER_LETTERS,
  MOCK_COVER_LETTER_PAGE_SIZE,
  MOCK_COVER_LETTER_TOTAL_PAGES,
} from '@/shared/mocks';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';

interface CoverLetterListProps {
  requestedPage: number;
}

/**
 * ## CoverLetterList
 *
 * @description
 * 자기소개서 목록 페이지의 헤더, 업로드 동선, 카드 그리드와 페이지네이션을 조립합니다.
 */
export function CoverLetterList({ requestedPage }: CoverLetterListProps) {
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), MOCK_COVER_LETTER_TOTAL_PAGES)
    : 1;
  const startIndex = (currentPage - 1) * MOCK_COVER_LETTER_PAGE_SIZE;
  const coverLetters = MOCK_COVER_LETTERS.slice(
    startIndex,
    startIndex + MOCK_COVER_LETTER_PAGE_SIZE
  );
  const hasMultiplePages = MOCK_COVER_LETTER_TOTAL_PAGES > 1;

  return (
    <section className="flex w-full flex-1 flex-col">
      <div className="flex items-end justify-between gap-6">
        <PageHeader
          description="작성한 자기소개서를 관리할 수 있습니다."
          title="내 자기소개서 목록"
        />
        <LinkButton
          className="h-9 w-auto rounded-full px-4 body-16"
          href={ROUTES.WRITING_CREATE}
          size="sm"
          variant="outline"
        >
          upload
        </LinkButton>
      </div>

      <ul className="mt-9 grid min-h-127.5 grid-cols-1 content-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coverLetters.map((coverLetter) => (
          <CoverLetterCard coverLetter={coverLetter} key={coverLetter.id} />
        ))}
      </ul>

      {hasMultiplePages ? (
        <Pagination
          className="mt-16 lg:mt-20"
          currentPage={currentPage}
          pathname={ROUTES.WRITING}
          totalPages={MOCK_COVER_LETTER_TOTAL_PAGES}
        />
      ) : null}
    </section>
  );
}
