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

  return <CoverLetterList requestedPage={parsePageParam(page)} />;
}
