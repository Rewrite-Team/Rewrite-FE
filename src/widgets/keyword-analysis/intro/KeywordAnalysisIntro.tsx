'use client';

import { useRouter } from 'next/navigation';

import { docsLottie } from '@/shared/assets/lotties';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/state-feedback';

interface KeywordAnalysisIntroProps {
  writingId: string;
}

/**
 * 자기소개서 키워드 분석을 시작할 수 있는 빈 상태 화면을 표시합니다.
 *
 * @remarks
 * 문서 Lottie와 분석 시작 버튼을 제공하며 버튼을 누르면 해당 자기소개서의 결과 경로로 이동합니다.
 */
export function KeywordAnalysisIntro({ writingId }: KeywordAnalysisIntroProps) {
  const router = useRouter();

  const handleAnalysisStart = () => {
    router.push(ROUTES.KEYWORD_ANALYSIS_RESULT(writingId));
  };

  return (
    <EmptyState
      action={{ label: '키워드 분석하기', onClick: handleAnalysisStart }}
      animationClassName="sm:size-56"
      animationData={docsLottie}
      className="max-w-none flex-1"
      title="자기소개서 키워드를 지금 바로 분석해보세요!"
    />
  );
}
