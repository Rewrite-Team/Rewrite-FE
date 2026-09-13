import { PageHeader } from '@/shared/ui/page-header';
import { InterviewIntro } from '@/widgets/interview';

export default async function WritingInterviewPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <section className="writing-feature-intro">
      <PageHeader
        description="자기소개서를 기반으로 AI가 예상 면접 질문을 생성하고 답변 연습을 도와줍니다."
        title="자기소개서 AI 면접"
      />
      <InterviewIntro writingId={id} />
    </section>
  );
}
