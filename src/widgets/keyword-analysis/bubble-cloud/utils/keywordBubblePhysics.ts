import { KEYWORD_BUBBLE_DEFAULT_BOUNDS } from '../constants';

import type { KeywordBubbleBounds, KeywordBubbleNode } from '../types';
import type { Force } from 'd3-force';

/** D3 force의 정착 속도, 충돌, 경계, 드래그 관성을 조절하는 물리 설정입니다. */
export const KEYWORD_BUBBLE_PHYSICS = {
  alphaDecay: 0.045,
  boundaryPadding: 8,
  boundaryStrength: 0.32,
  boundaryVelocityRetention: 0.35,
  chargeStrength: -1.5,
  collisionIterations: 4,
  collisionPadding: 3,
  collisionStrength: 1,
  dragAlphaTarget: 0.12,
  initialAlpha: 0.72,
  maxThrowVelocity: 3.5,
  minimumAlpha: 0.006,
  reducedMotionTickCount: 240,
  releaseAlpha: 0.28,
  throwVelocityScale: 0.35,
  velocityDecay: 0.5,
  xForceStrength: 0.028,
  yForceStrength: 0.042,
} as const;

interface BubblePosition {
  x: number;
  y: number;
}

/**
 * 버블의 중심 좌표를 반지름과 경계 여백을 고려한 ViewBox 내부로 제한합니다.
 *
 * @param position - 제한할 버블의 중심 좌표입니다.
 * @param radius - 버블의 반지름입니다.
 * @param bounds - 버블이 움직일 수 있는 실제 렌더링 영역입니다.
 * @returns 렌더링 영역의 경계를 벗어나지 않도록 보정한 중심 좌표입니다.
 */
export const clampBubblePosition = (
  position: BubblePosition,
  radius: number,
  bounds: KeywordBubbleBounds = KEYWORD_BUBBLE_DEFAULT_BOUNDS
): BubblePosition => {
  const { boundaryPadding } = KEYWORD_BUBBLE_PHYSICS;

  return {
    x: Math.max(
      radius + boundaryPadding,
      Math.min(bounds.width - radius - boundaryPadding, position.x)
    ),
    y: Math.max(
      radius + boundaryPadding,
      Math.min(bounds.height - radius - boundaryPadding, position.y)
    ),
  };
};

/**
 * 시뮬레이션 노드를 렌더링 경계 안으로 제한하고 경계에 닿은 속도를 감쇠해 반사합니다.
 *
 * @param node - 위치와 속도를 보정할 D3 버블 노드입니다.
 * @param bounds - 버블이 움직일 수 있는 실제 렌더링 영역입니다.
 * @returns 보정된 버블 중심 좌표입니다.
 */
export const constrainBubbleNodeToBounds = (
  node: KeywordBubbleNode,
  bounds: KeywordBubbleBounds
): BubblePosition => {
  const currentPosition = {
    x: node.x ?? bounds.width / 2,
    y: node.y ?? bounds.height / 2,
  };
  const nextPosition = clampBubblePosition(currentPosition, node.radius, bounds);

  if (nextPosition.x !== currentPosition.x) {
    node.vx = -(node.vx ?? 0) * KEYWORD_BUBBLE_PHYSICS.boundaryVelocityRetention;
  }

  if (nextPosition.y !== currentPosition.y) {
    node.vy = -(node.vy ?? 0) * KEYWORD_BUBBLE_PHYSICS.boundaryVelocityRetention;
  }

  node.x = nextPosition.x;
  node.y = nextPosition.y;

  return nextPosition;
};

/**
 * 버블이 ViewBox 경계를 벗어나면 안쪽 방향으로 속도를 가하는 D3 force를 생성합니다.
 *
 * @remarks
 * 이 force는 D3 시뮬레이션 tick마다 노드의 `vx`와 `vy`를 직접 변경합니다.
 *
 * @param bounds - 경계 force를 적용할 실제 렌더링 영역입니다.
 * @returns 키워드 버블 노드에 적용할 경계 force입니다.
 */
export const createBoundaryForce = (
  bounds: KeywordBubbleBounds = KEYWORD_BUBBLE_DEFAULT_BOUNDS
): Force<KeywordBubbleNode, undefined> => {
  let nodes: KeywordBubbleNode[] = [];
  const { boundaryPadding, boundaryStrength } = KEYWORD_BUBBLE_PHYSICS;

  const force = () => {
    nodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) return;

      const minX = node.radius + boundaryPadding;
      const maxX = bounds.width - node.radius - boundaryPadding;
      const minY = node.radius + boundaryPadding;
      const maxY = bounds.height - node.radius - boundaryPadding;

      if (node.x < minX) {
        node.vx = (node.vx ?? 0) + (minX - node.x) * boundaryStrength;
      } else if (node.x > maxX) {
        node.vx = (node.vx ?? 0) + (maxX - node.x) * boundaryStrength;
      }

      if (node.y < minY) {
        node.vy = (node.vy ?? 0) + (minY - node.y) * boundaryStrength;
      } else if (node.y > maxY) {
        node.vy = (node.vy ?? 0) + (maxY - node.y) * boundaryStrength;
      }
    });
  };

  force.initialize = (initializedNodes: KeywordBubbleNode[]) => {
    nodes = initializedNodes;
  };

  return force;
};
