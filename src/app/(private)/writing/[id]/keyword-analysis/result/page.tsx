import { ROUTES } from '@/shared/constants/routes';
import { BadgeGroup } from '@/shared/ui/badge';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { KeywordAnalysisResult } from '@/widgets/keyword-analysis';

/**
 * ## KeywordAnalysisResultPage
 *
 * @description
 * 선택한 자기소개서의 키워드 중요도와 시각화 결과를 제공하는 페이지입니다.
 */
export default async function KeywordAnalysisResultPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="writing-detail-content">
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
