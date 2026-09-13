import { ROUTES } from '@/shared/constants/routes';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { CoverLetterList } from '@/widgets/cover-letter-list';

interface WritingPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

const DEFAULT_PAGE = 1;

const parsePageParam = (pageParam?: string | string[]) => {
  const value = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
};

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const { page } = await searchParams;

  return (
    <section className="flex w-full flex-1 flex-col">
      <div className="flex items-end justify-between gap-6">
        <PageHeader
          description="작성한 자기소개서를 관리할 수 있습니다."
          title="내 자기소개서 목록"
        />
        {/* TODO: 자기소개서 생성 API 연결 후 생성된 ID를 등록 플로우에 전달한다. */}
        <LinkButton
          className="h-9 w-auto rounded-full px-4 body-16"
          href={ROUTES.WRITING_CREATE}
          variant="outline"
        >
          CREATE
        </LinkButton>
      </div>

      <CoverLetterList requestedPage={parsePageParam(page)} />
    </section>
  );
}
