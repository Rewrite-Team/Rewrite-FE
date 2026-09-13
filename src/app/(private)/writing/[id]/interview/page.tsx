import { PageHeader } from '@/shared/ui/page-header';
import { InterviewIntro } from '@/widgets/interview';

/**
 * ## WritingInterviewPage
 *
 * @description
 * 선택한 자기소개서를 기반으로 AI 모의 면접을 시작할 수 있는 진입 페이지입니다.
 */
export default async function WritingInterviewPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="writing-detail-content">
      <PageHeader
        description="자기소개서를 기반으로 AI가 예상 면접 질문을 생성하고 답변 연습을 도와줍니다."
        title="자기소개서 AI 면접"
      />
      <InterviewIntro writingId={id} />
    </section>
  );
}
