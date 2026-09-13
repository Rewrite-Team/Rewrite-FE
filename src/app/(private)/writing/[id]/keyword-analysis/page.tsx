import { PageHeader } from '@/shared/ui/page-header';
import { KeywordAnalysisIntro } from '@/widgets/keyword-analysis';

/**
 * ## KeywordAnalysisPage
 *
 * @description
 * 선택한 자기소개서의 키워드 분석 기능을 안내하고 분석을 시작할 수 있는 진입 페이지입니다.
 */
export default async function KeywordAnalysisPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="writing-detail-content">
      <PageHeader
        description="AI가 자기소개서의 핵심 키워드를 분석할 수 있도록 도와줍니다."
        title="자기소개서 키워드 분석"
      />
      <KeywordAnalysisIntro writingId={id} />
    </section>
  );
}
