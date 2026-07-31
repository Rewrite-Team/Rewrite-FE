import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('ISO 8601 날짜와 시간에서 날짜 부분만 표시한다', () => {
    expect(formatDate('2026-06-20T14:00:00')).toBe('2026.06.20');
  });
});
