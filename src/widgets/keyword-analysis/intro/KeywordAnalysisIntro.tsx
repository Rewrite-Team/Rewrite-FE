'use client';

import { useRouter } from 'next/navigation';

import { docsLottie } from '@/shared/assets/lotties';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/state-feedback';

interface KeywordAnalysisIntroProps {
  writingId: string;
}

/**
 * ## KeywordAnalysisIntro
 *
 * @description
 * 자기소개서 키워드 분석을 시작하기 전에 로티와 시작 액션을 표시합니다.
 * 문서 형태의 Lottie를 사용해 분석 대상이 자기소개서임을 시각적으로 전달합니다.
 *
 * @param writingId - 분석 결과 경로를 구성할 자기소개서 식별자
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
