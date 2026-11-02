import { CoverLetterMetadataHeader } from '@/widgets/cover-letter-detail';
import { InterviewSession } from '@/widgets/interview';

/**
 * ## WritingInterviewSessionPage
 *
 * @description
 * 선택한 자기소개서를 기반으로 AI와 채팅형 모의 면접을 진행하는 세션 페이지입니다.
 */
interface WritingInterviewSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingInterviewSessionPage({
  params,
}: WritingInterviewSessionPageProps) {
  const { id } = await params;

  return (
    <div className="writing-detail-content" data-layout-footer="hidden">
      <CoverLetterMetadataHeader
        coverLetterId={id}
        className="w-full gap-2.5 sm:gap-3"
        titleClassName="heading-18"
      />
      <InterviewSession key={id} writingId={id} />
    </div>
  );
}
