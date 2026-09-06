import { KEYWORD_BUBBLE_VIEWBOX } from '../constants';
import {
  KEYWORD_BUBBLE_PHYSICS,
  clampBubblePosition,
  createBoundaryForce,
} from './keywordBubblePhysics';

import type { KeywordBubbleNode } from '../types';

const createNode = (overrides: Partial<KeywordBubbleNode> = {}): KeywordBubbleNode => ({
  displayLines: ['테스트'],
  fill: '#000000',
  fontSize: 12,
  frequency: 1,
  id: '테스트-0',
  importance: 50,
  keyword: '테스트',
  radius: 24,
  stroke: '#ffffff',
  textColor: '#ffffff',
  vx: 0,
  vy: 0,
  x: KEYWORD_BUBBLE_VIEWBOX.width / 2,
  y: KEYWORD_BUBBLE_VIEWBOX.height / 2,
  ...overrides,
});

describe('clampBubblePosition', () => {
  it('버블이 ViewBox 경계를 벗어나지 않도록 좌표를 제한한다', () => {
    const radius = 24;
    const minPosition = radius + KEYWORD_BUBBLE_PHYSICS.boundaryPadding;

    expect(clampBubblePosition({ x: -100, y: 1_000 }, radius)).toEqual({
      x: minPosition,
      y: KEYWORD_BUBBLE_VIEWBOX.height - minPosition,
    });
  });
});

describe('createBoundaryForce', () => {
  it('경계 밖 노드에 ViewBox 안쪽 방향의 속도를 더한다', () => {
    const node = createNode({ x: 0, y: KEYWORD_BUBBLE_VIEWBOX.height });
    const boundaryForce = createBoundaryForce();

    boundaryForce.initialize?.([node], Math.random);
    boundaryForce(1);

    expect(node.vx).toBeGreaterThan(0);
    expect(node.vy).toBeLessThan(0);
  });

  it('경계 안쪽 노드의 속도는 변경하지 않는다', () => {
    const node = createNode();
    const boundaryForce = createBoundaryForce();

    boundaryForce.initialize?.([node], Math.random);
    boundaryForce(1);

    expect(node.vx).toBe(0);
    expect(node.vy).toBe(0);
  });
});
