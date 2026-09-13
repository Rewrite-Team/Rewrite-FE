'use client';

import { useRouter } from 'next/navigation';

import { interviewLottie } from '@/shared/assets/lotties';
import { ROUTES } from '@/shared/constants/routes';
import { StateFeedback } from '@/shared/ui/state-feedback';

interface InterviewIntroProps {
  writingId: string;
}

/**
 * 자기소개서를 바탕으로 한 AI 모의 면접을 시작할 수 있는 진입 화면입니다.
 */
export function InterviewIntro({ writingId }: InterviewIntroProps) {
  const router = useRouter();

  const handleInterviewStart = () => {
    router.push(ROUTES.INTERVIEW_SESSION(writingId));
  };

  return (
    <StateFeedback
      action={{ label: '모의면접 시작하기', onClick: handleInterviewStart }}
      animationClassName="aspect-[1303/816] h-auto w-full max-w-120"
      animationData={interviewLottie}
      className="max-w-none flex-1"
      title="AI 면접을 지금 시작해보세요!"
    />
  );
}
