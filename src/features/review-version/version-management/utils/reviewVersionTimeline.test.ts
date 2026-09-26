import type { ReviewVersionSummary } from '@/entities/review-version';

import { createReviewVersionSegmentGradient, getReviewVersionColor } from './reviewVersionTimeline';

const versions: ReviewVersionSummary[] = [
  { id: 'v1', label: 'V.0.1', createdAt: '2026-05-20T14:00:00', status: 'COMPLETED' },
  { id: 'v2', label: 'V.0.2', createdAt: '2026-05-21T14:00:00', status: 'COMPLETED' },
  { id: 'v3', label: 'V.0.3', createdAt: '2026-05-22T14:00:00', status: 'GENERATING' },
  { id: 'v4', label: 'V.0.4', createdAt: '2026-05-23T14:00:00', status: 'FAILED' },
];

describe('reviewVersionTimeline', () => {
  it('선택, 완료, 생성 중, 실패 버전에 대응하는 색상을 반환한다', () => {
    expect(getReviewVersionColor(versions[0], 'v1')).toBe('var(--color-primary-500)');
    expect(getReviewVersionColor(versions[1], 'v1')).toBe('var(--color-gray-400)');
    expect(getReviewVersionColor(versions[2], 'v1')).toBe('var(--color-gray-400)');
    expect(getReviewVersionColor(versions[3], 'v1')).toBe('var(--color-error-400)');
  });

  it('각 원 사이를 위 원의 색에서 아래 원의 색으로 연결한다', () => {
    expect(createReviewVersionSegmentGradient(versions[0], versions[1], 'v1')).toBe(
      'linear-gradient(to bottom, var(--color-primary-500), var(--color-gray-400))'
    );
    expect(createReviewVersionSegmentGradient(versions[2], versions[3], 'v1')).toBe(
      'linear-gradient(to bottom, var(--color-gray-400), var(--color-error-400))'
    );
  });
});
