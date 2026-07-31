export const MOCK_COVER_LETTER_PAGE_SIZE = 9;
export const MOCK_COVER_LETTER_TOTAL_PAGES = 5;

const REVIEW_STATUSES = ['WRITING', 'REVIEWING', 'REVIEWED', 'REVIEW_FAILED'] as const;
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
 * ## MOCK_COVER_LETTERS
 *
 * @description
 * 자기소개서 목록 UI와 페이지네이션을 확인하기 위한 임시 데이터입니다.
 * 실제 목록 API가 연결되면 서버 응답으로 대체합니다.
 */
export const MOCK_COVER_LETTERS = Array.from(
  { length: MOCK_COVER_LETTER_PAGE_SIZE * MOCK_COVER_LETTER_TOTAL_PAGES },
  (_, index) => ({
    id: String(index + 1),
    title: TITLES[index % TITLES.length],
    companyName: COMPANY_NAMES[index % COMPANY_NAMES.length],
    positionTitle: POSITION_TITLES[index % POSITION_TITLES.length],
    displayStatus: REVIEW_STATUSES[index % REVIEW_STATUSES.length],
    createdAt: '2026-06-20T14:00:00',
    latestReviewedVersionId:
      REVIEW_STATUSES[index % REVIEW_STATUSES.length] === 'REVIEWED'
        ? `rv_${String(index + 1).padStart(2, '0')}`
        : null,
  })
);
