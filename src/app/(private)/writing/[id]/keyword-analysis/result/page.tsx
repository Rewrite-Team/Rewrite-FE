import { ROUTES } from '@/shared/constants/routes';
import { BadgeGroup } from '@/shared/ui/badge';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { KeywordAnalysisResult } from '@/widgets/keyword-analysis';

export default async function KeywordAnalysisResultPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="flex w-full flex-1 flex-col px-5 sm:px-8 lg:px-11">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* TODO: 자기소개서 상세 API 연결 후 회사, 직무, 제목과 버전 정보를 교체합니다. */}
        <PageHeader
          className="min-w-0 gap-3"
          eyebrow={<BadgeGroup companyName="회사명" jobName="직무" />}
          title="자기소개서 제목"
          titleClassName="truncate body-20"
          version="V0.1"
        />

        <LinkButton
          className="h-8 w-auto rounded-full px-4"
          href={ROUTES.KEYWORD_ANALYSIS(id)}
          size="sm"
          variant="outline"
        >
          키워드 분석 다시하기
        </LinkButton>
      </header>

      <KeywordAnalysisResult />
    </section>
  );
}
