import { getMockCoverLetterDetail } from '@/entities/cover-letter';
import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';
import { CoverLetterDetailEditor } from '@/widgets/cover-letter-detail';

interface WritingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingDetailPage({ params }: WritingDetailPageProps) {
  const { id } = await params;
  // TODO: 자기소개서 상세 조회 API 연결 시 mock 데이터를 서버 응답으로 교체한다.
  const coverLetter = getMockCoverLetterDetail(id);

  return (
    <section className="writing-detail-content">
      <PageHeader
        className="mb-10"
        eyebrow={
          <BadgeGroup companyName={coverLetter.companyName} jobName={coverLetter.positionTitle} />
        }
        title={coverLetter.title}
        version={coverLetter.version}
      />

      <CoverLetterDetailEditor questions={coverLetter.questions} version={coverLetter.version} />
    </section>
  );
}
