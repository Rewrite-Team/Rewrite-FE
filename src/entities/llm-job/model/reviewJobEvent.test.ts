import { parseCoverLetterReviewEvent } from './reviewJobEvent';

describe('parseCoverLetterReviewEvent', () => {
  it('첨삭 문항의 중간 결과를 검증한다', () => {
    const items = [{ questionId: 'q1', order: 1, rewrittenAnswer: '첨삭 결과' }];
    expect(parseCoverLetterReviewEvent('review.questions', JSON.stringify({ items }))).toEqual({
      event: 'review.questions',
      data: { items },
    });
  });
  it('등록되지 않은 이벤트는 파싱 없이 무시한다', () => {
    expect(parseCoverLetterReviewEvent('heartbeat', '')).toBeUndefined();
  });
  it('잘못된 진행 상태 데이터는 처리하지 않는다', () => {
    expect(() =>
      parseCoverLetterReviewEvent('job.state', JSON.stringify({ status: 'INVALID' }))
    ).toThrow();
  });
});
