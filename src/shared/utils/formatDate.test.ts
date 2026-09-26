import { formatDate, formatDateTime } from './formatDate';

describe('formatDate', () => {
  it('ISO 8601 날짜와 시간에서 날짜 부분만 표시한다', () => {
    expect(formatDate('2026-06-20T14:00:00')).toBe('2026.06.20');
  });

  it('ISO 8601 날짜와 시간을 분 단위까지 표시한다', () => {
    expect(formatDateTime('2026-06-20T14:05:00')).toBe('2026.06.20 14:05');
  });

  it('시간이 없으면 날짜만 표시한다', () => {
    expect(formatDateTime('2026-06-20')).toBe('2026.06.20');
  });
});
