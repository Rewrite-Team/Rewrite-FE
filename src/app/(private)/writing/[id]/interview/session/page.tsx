import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';
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
      {/* TODO: 자기소개서 상세 API 연결 후 회사, 직무, 제목 정보를 교체합니다. */}
      <PageHeader
        className="w-full gap-2.5 sm:gap-3"
        eyebrow={
          <BadgeGroup
            companyBadgeClassName="h-5 px-2.5"
            companyName="회사명"
            jobBadgeClassName="h-5 px-2.5"
            jobName="직무"
          />
        }
        title="자기소개서 제목"
        titleClassName="heading-18"
      />
      <InterviewSession key={id} writingId={id} />
    </div>
  );
}
