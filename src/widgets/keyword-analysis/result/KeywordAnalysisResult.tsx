import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';
import { Title } from '@/shared/ui/title';

import { KeywordBubbleCloud } from '../bubble-cloud/KeywordBubbleCloud';

const MOCK_KEYWORD_ANALYSIS_ITEMS: KeywordAnalysisKeyword[] = [
  { keyword: '사용자 경험', frequency: 20, importance: 98 },
  { keyword: 'React', frequency: 19, importance: 95 },
  { keyword: '협업', frequency: 18, importance: 92 },
  { keyword: 'TypeScript', frequency: 17, importance: 89 },
  { keyword: '문제 해결', frequency: 16, importance: 86 },
  { keyword: '접근성', frequency: 15, importance: 82 },
  { keyword: 'Next.js', frequency: 14, importance: 79 },
  { keyword: '성능 최적화', frequency: 13, importance: 75 },
  { keyword: '디자인 시스템', frequency: 12, importance: 71 },
  { keyword: '상태 관리', frequency: 11, importance: 68 },
  { keyword: '테스트', frequency: 10, importance: 64 },
  { keyword: 'API', frequency: 9, importance: 59 },
  { keyword: '웹 표준', frequency: 8, importance: 55 },
  { keyword: '컴포넌트', frequency: 7, importance: 51 },
  { keyword: '데이터', frequency: 6, importance: 47 },
  { keyword: '리팩터링', frequency: 5, importance: 43 },
  { keyword: '커뮤니케이션', frequency: 4, importance: 39 },
  { keyword: 'Git', frequency: 3, importance: 35 },
  { keyword: '애자일', frequency: 2, importance: 31 },
  { keyword: '코드 리뷰', frequency: 1, importance: 27 },
];

/**
 * 자기소개서에서 추출한 핵심 키워드를 물리 기반 버블 클라우드로 표시합니다.
 *
 * @remarks
 * 현재는 결과 API 연동 전이므로 목 키워드 데이터를 사용합니다.
 * 키워드 차트는 후속 구현에서 별도 영역으로 추가합니다.
 */
export function KeywordAnalysisResult() {
  return (
    <section
      aria-labelledby="keyword-cloud-title"
      className="mt-9 w-full max-w-130 rounded-2xl border border-white/6 bg-gray-800/70 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-4"
    >
      <Title as="h2" className="sr-only" id="keyword-cloud-title">
        핵심 키워드 버블 워드클라우드
      </Title>

      <KeywordBubbleCloud keywords={MOCK_KEYWORD_ANALYSIS_ITEMS} />
    </section>
  );
}
