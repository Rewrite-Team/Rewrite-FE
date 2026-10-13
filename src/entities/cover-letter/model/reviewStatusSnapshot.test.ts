import { matchesCoverLetterReviewStatusSnapshot } from './reviewStatusSnapshot';

import type { CoverLetterListResponse } from '../api/types';

const list: CoverLetterListResponse = {
  items: [
    {
      id: 'cover-1',
      title: null,
      companyName: null,
      positionTitle: null,
      displayStatus: 'WRITING',
      createdAt: '2026-10-13T00:00:00Z',
      latestReviewedVersionId: null,
    },
  ],
  page: 1,
  size: 6,
  totalItems: 1,
  totalPages: 1,
};
const status = {
  coverLetterId: 'cover-1',
  displayStatus: 'WRITING',
  latestReviewedVersionId: null,
};

describe('matchesCoverLetterReviewStatusSnapshot', () => {
  it('서버와 목록의 개수 및 상태가 같을 때만 일치한다', () => {
    expect(
      matchesCoverLetterReviewStatusSnapshot(JSON.stringify({ items: [status] }), [list])
    ).toBe(true);
    expect(
      matchesCoverLetterReviewStatusSnapshot(
        JSON.stringify({
          items: [{ ...status, displayStatus: 'REVIEWED', latestReviewedVersionId: 'review-1' }],
        }),
        [list]
      )
    ).toBe(false);
    expect(matchesCoverLetterReviewStatusSnapshot(JSON.stringify({ items: [] }), [list])).toBe(
      false
    );
    expect(matchesCoverLetterReviewStatusSnapshot(JSON.stringify({ items: [status] }), [])).toBe(
      false
    );
  });

  it.each(['invalid json', '{}', '{"items":[{"coverLetterId":"cover-1"}]}'])(
    '잘못된 스냅샷 %s는 재조회가 필요하다고 판단한다',
    (data) => {
      expect(matchesCoverLetterReviewStatusSnapshot(data, [list])).toBe(false);
    }
  );
});
