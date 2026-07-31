import { CoverLetterList } from '@/widgets/cover-letter-list';

interface WritingPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const { page } = await searchParams;
  const requestedPage = Number(Array.isArray(page) ? page[0] : page);

  return <CoverLetterList requestedPage={requestedPage} />;
}
