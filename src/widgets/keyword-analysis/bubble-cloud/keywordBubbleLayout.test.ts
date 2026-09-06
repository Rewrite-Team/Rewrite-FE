import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import { KEYWORD_BUBBLE_MAX_COUNT, KEYWORD_BUBBLE_RADIUS } from './constants';
import { createBubbleNodes } from './keywordBubbleLayout';

const createKeyword = (index: number, importance = index): KeywordAnalysisKeyword => ({
  frequency: index + 1,
  importance,
  keyword: `키워드 ${index + 1}`,
});

describe('createBubbleNodes', () => {
  it('표시할 키워드를 최대 개수로 제한한다', () => {
    const keywords = Array.from({ length: KEYWORD_BUBBLE_MAX_COUNT + 1 }, (_, index) =>
      createKeyword(index)
    );

    expect(createBubbleNodes(keywords)).toHaveLength(KEYWORD_BUBBLE_MAX_COUNT);
  });

  it('최소·최대 중요도를 설정된 반지름 범위에 대응시킨다', () => {
    const nodes = createBubbleNodes([createKeyword(0, 10), createKeyword(1, 100)]);

    expect(nodes[0]?.radius).toBe(KEYWORD_BUBBLE_RADIUS.min);
    expect(nodes[1]?.radius).toBe(KEYWORD_BUBBLE_RADIUS.max);
  });

  it('모든 중요도가 같으면 중간 크기의 버블을 만든다', () => {
    const nodes = createBubbleNodes([createKeyword(0, 50), createKeyword(1, 50)]);
    const middleRadius = (KEYWORD_BUBBLE_RADIUS.min + KEYWORD_BUBBLE_RADIUS.max) / 2;

    expect(nodes.every(({ radius }) => radius === middleRadius)).toBe(true);
  });

  it('긴 키워드는 최대 두 줄로 나누고 영역을 넘는 문자열을 줄인다', () => {
    const longKeyword = '사용자중심제품개발과데이터기반문제해결능력';
    const [longKeywordNode] = createBubbleNodes([
      { frequency: 1, importance: 10, keyword: longKeyword },
      createKeyword(1, 100),
    ]);

    expect(longKeywordNode?.displayLines).toHaveLength(2);
    expect(longKeywordNode?.displayLines.some((line) => line.endsWith('…'))).toBe(true);
  });
});
