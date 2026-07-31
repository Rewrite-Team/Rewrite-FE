import { CoverLetterCard } from '@/entities/cover-letter';
import { ROUTES } from '@/shared/constants/routes';
import { getMockCoverLetterListResponse } from '@/shared/mocks';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';
import { EmptyState } from '@/shared/ui/state-feedback';

interface CoverLetterListProps {
  requestedPage: number;
}

/**
 * ## CoverLetterList
 *
 * @description
 * 자기소개서 목록 페이지의 헤더, 업로드 동선, 빈 상태, 카드 그리드와 페이지네이션을 조립합니다.
 */
export function CoverLetterList({ requestedPage }: CoverLetterListProps) {
  const { items: coverLetters, page, totalPages } = getMockCoverLetterListResponse(requestedPage);
  const hasCoverLetters = coverLetters.length > 0;
  const hasMultiplePages = totalPages > 1;

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
          variant="outline"
        >
          CREATE
        </LinkButton>
      </div>

      {hasCoverLetters ? (
        <>
          <ul className="mt-9 grid grid-cols-1 content-start gap-6 sm:grid-cols-2 lg:min-h-127.5 lg:grid-cols-3">
            {coverLetters.map((coverLetter) => (
              <CoverLetterCard coverLetter={coverLetter} key={coverLetter.id} />
            ))}
          </ul>

          {hasMultiplePages ? (
            <Pagination
              className="mt-16 lg:mt-20"
              currentPage={page}
              pathname={ROUTES.WRITING}
              totalPages={totalPages}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          className="mt-9 self-center lg:min-h-127.5"
          description="새로운 자기소개서를 작성해 보세요."
          title="아직 작성한 자기소개서가 없어요"
        />
      )}
    </section>
  );
}
