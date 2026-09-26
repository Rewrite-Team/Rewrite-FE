import type { ReviewVersionSummary } from '@/entities/review-version';

import {
  createReviewVersionTimelineGradient,
  getReviewVersionColor,
} from './reviewVersionTimeline';

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
    expect(getReviewVersionColor(versions[2], 'v1')).toBe('var(--color-gray-500)');
    expect(getReviewVersionColor(versions[3], 'v1')).toBe('var(--color-error-400)');
  });

  it('선택된 버전에 맞닿은 구간에만 그라데이션을 만든다', () => {
    expect(createReviewVersionTimelineGradient(versions, 'v1')).toBe(
      'linear-gradient(to bottom, var(--color-primary-500) 0%, var(--color-gray-400) 33.3333%, var(--color-gray-400) 50%, var(--color-gray-500) 50%, var(--color-gray-500) 83.3333%, var(--color-error-400) 83.3333%, var(--color-error-400) 100%)'
    );
  });
});
