import { KEYWORD_BUBBLE_VIEWBOX } from './constants';

import type { KeywordBubbleNode } from './types';
import type { Force } from 'd3-force';

export const KEYWORD_BUBBLE_PHYSICS = {
  alphaDecay: 0.045,
  boundaryPadding: 8,
  boundaryStrength: 0.32,
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

export const clampBubblePosition = (position: BubblePosition, radius: number): BubblePosition => {
  const { boundaryPadding } = KEYWORD_BUBBLE_PHYSICS;

  return {
    x: Math.max(
      radius + boundaryPadding,
      Math.min(KEYWORD_BUBBLE_VIEWBOX.width - radius - boundaryPadding, position.x)
    ),
    y: Math.max(
      radius + boundaryPadding,
      Math.min(KEYWORD_BUBBLE_VIEWBOX.height - radius - boundaryPadding, position.y)
    ),
  };
};

export const createBoundaryForce = (): Force<KeywordBubbleNode, undefined> => {
  let nodes: KeywordBubbleNode[] = [];
  const { boundaryPadding, boundaryStrength } = KEYWORD_BUBBLE_PHYSICS;

  const force = () => {
    nodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) return;

      const minX = node.radius + boundaryPadding;
      const maxX = KEYWORD_BUBBLE_VIEWBOX.width - node.radius - boundaryPadding;
      const minY = node.radius + boundaryPadding;
      const maxY = KEYWORD_BUBBLE_VIEWBOX.height - node.radius - boundaryPadding;

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
