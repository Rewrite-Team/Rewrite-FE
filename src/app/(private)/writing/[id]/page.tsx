import { CoverLetterDetailScreen } from '@/widgets/cover-letter-detail';

interface WritingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingDetailPage({ params }: WritingDetailPageProps) {
  const { id } = await params;
  return <CoverLetterDetailScreen coverLetterId={id} />;
}
