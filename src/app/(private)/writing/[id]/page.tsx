import { getMockCoverLetterVersionRecords } from '@/features/review-version/version-management';
import { CoverLetterVersionDetail } from '@/widgets/cover-letter-detail';

interface WritingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingDetailPage({ params }: WritingDetailPageProps) {
  const { id } = await params;
  // TODO: 버전별 자기소개서 상세 조회 API 연결 시 mock 데이터를 서버 응답으로 교체한다.
  const records = getMockCoverLetterVersionRecords(id);

  return <CoverLetterVersionDetail records={records} />;
}
