import { ROUTES } from '@/shared/constants/routes';
import { LinkButton } from '@/shared/ui/button';
import { CoverLetterMetadataHeader } from '@/widgets/cover-letter-detail';
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
        <CoverLetterMetadataHeader
          coverLetterId={id}
          className="min-w-0 gap-3"
          titleClassName="truncate body-20"
          showVersion
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
