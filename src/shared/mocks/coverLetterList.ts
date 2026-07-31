const PAGE_SIZE = 9;
const TOTAL_ITEMS = 21;

const DISPLAY_STATUSES = ['WRITING', 'REVIEWING', 'REVIEWED', 'REVIEW_FAILED'] as const;
const TITLES = [
  '사용자 경험을 고민하는 프론트엔드 개발자',
  '작은 개선을 꾸준히 만드는 개발자',
  '협업으로 더 나은 답을 찾는 사람',
  '문제의 본질을 탐구하는 프론트엔드 개발자',
  '데이터로 사용자의 불편을 해결한 경험',
  '빠르게 배우고 깊이 이해하는 개발자',
  '팀의 성장을 함께 만드는 동료',
  '사용자와 기술을 잇는 개발자',
  '끝까지 책임지는 프론트엔드 개발자',
] as const;
const COMPANY_NAMES = ['Re:write', '오픈AI', '넥스트랩'] as const;
const POSITION_TITLES = ['프론트엔드', '웹 개발', 'UI 엔지니어'] as const;

/**
 * ## getMockCoverLetterListResponse
 *
 * @description
 * 자기소개서 목록 API와 동일한 페이지 응답 구조를 만드는 임시 목 함수입니다.
 * 요청 페이지를 실제 데이터 범위로 정규화하고 해당 페이지의 항목과 페이지 메타데이터를 반환합니다.
 * 실제 목록 API가 연결되면 이 함수와 목 데이터를 함께 제거합니다.
 *
 * @param requestedPage - 화면에서 요청한 1부터 시작하는 페이지 번호
 * @returns 자기소개서 목록과 페이지 메타데이터
 */
const MOCK_COVER_LETTERS = Array.from({ length: TOTAL_ITEMS }, (_, index) => {
  const displayStatus = DISPLAY_STATUSES[index % DISPLAY_STATUSES.length];

  return {
    id: `cl_${String(index + 1).padStart(2, '0')}`,
    title: TITLES[index % TITLES.length],
    companyName: COMPANY_NAMES[index % COMPANY_NAMES.length],
    positionTitle: POSITION_TITLES[index % POSITION_TITLES.length],
    displayStatus,
    createdAt: '2026-06-20T14:00:00',
    latestReviewedVersionId:
      displayStatus === 'REVIEWED' ? `rv_${String(index + 1).padStart(2, '0')}` : null,
  };
});

export const getMockCoverLetterListResponse = (requestedPage: number) => {
  const totalItems = MOCK_COVER_LETTERS.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const page = Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1));
  const startIndex = (page - 1) * PAGE_SIZE;

  return {
    items: MOCK_COVER_LETTERS.slice(startIndex, startIndex + PAGE_SIZE),
    page,
    size: PAGE_SIZE,
    totalItems,
    totalPages,
  };
};
