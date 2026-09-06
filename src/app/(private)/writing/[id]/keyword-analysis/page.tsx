import { PageHeader } from '@/shared/ui/page-header';
import { KeywordAnalysisIntro } from '@/widgets/keyword-analysis';

export default async function KeywordAnalysisPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="flex w-full flex-1 flex-col px-5 sm:px-8 lg:px-11">
      <PageHeader
        description="AI가 자기소개서의 핵심 키워드를 분석할 수 있도록 도와줍니다."
        title="자기소개서 키워드 분석"
      />
      <KeywordAnalysisIntro writingId={id} />
    </section>
  );
}
