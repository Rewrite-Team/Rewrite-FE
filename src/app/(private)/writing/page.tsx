import { getCoverLetterListParams } from '@/entities/cover-letter';
import { CreateCoverLetterButton } from '@/features/cover-letter/create-flow';
import { PageHeader } from '@/shared/ui/page-header';
import { CoverLetterList } from '@/widgets/cover-letter-list';

interface WritingPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

const parsePageParam = (pageParam?: string | string[]) => {
  const value = Array.isArray(pageParam) ? pageParam[0] : pageParam;

  return getCoverLetterListParams(Number(value)).page;
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
        <CreateCoverLetterButton />
      </div>

      <CoverLetterList requestedPage={parsePageParam(page)} />
    </section>
  );
}
