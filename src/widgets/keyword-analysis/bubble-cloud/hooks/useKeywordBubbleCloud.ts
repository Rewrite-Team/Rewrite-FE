import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
} from 'd3-force';

import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import { KEYWORD_BUBBLE_VIEWBOX } from '../constants';
import { createBubbleNodes } from '../utils/keywordBubbleLayout';
import {
  KEYWORD_BUBBLE_PHYSICS,
  clampBubblePosition,
  createBoundaryForce,
} from '../utils/keywordBubblePhysics';

import type { KeywordBubbleNode, KeywordBubbleTooltipState } from '../types';

const TOOLTIP_VERTICAL_EDGE_THRESHOLD = 82;
const TOOLTIP_HORIZONTAL_BOUNDARY_PADDING = 92;
const TOOLTIP_OFFSET = 14;

interface BubbleDragState {
  id: string;
  pointerId: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
}

/**
 * 키워드 데이터를 D3 force 시뮬레이션에 연결하고 버블 상호작용 상태를 관리합니다.
 *
 * @remarks
 * 키워드 구성이 변경되면 등장 애니메이션을 다시 실행하고 삭제된 버블의 위치 캐시를 정리합니다.
 * 포인터 드래그 중에는 버블을 고정하며 포인터를 놓을 때 마지막 이동 속도를 관성으로 전달합니다.
 * 사용자가 모션 감소를 설정한 경우 시뮬레이션을 즉시 정착시키고 드래그 좌표를 직접 반영합니다.
 *
 * @param keywords - 버블 노드로 변환할 키워드 분석 결과입니다.
 * @returns 버블 렌더링 데이터, SVG ref, Tooltip 상태와 포인터 이벤트 처리 함수입니다.
 */
export function useKeywordBubbleCloud(keywords: KeywordAnalysisKeyword[]) {
  const [activeTooltip, setActiveTooltip] = useState<KeywordBubbleTooltipState | null>(null);
  const [isEntryAnimationActive, setIsEntryAnimationActive] = useState(false);
  const bubbleElementsRef = useRef(new Map<string, SVGGElement>());
  const bubblePositionsRef = useRef(new Map<string, { x: number; y: number }>());
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<KeywordBubbleNode[]>([]);
  const simulationRef = useRef<Simulation<KeywordBubbleNode, undefined> | null>(null);
  const activeDragRef = useRef<BubbleDragState | null>(null);
  const prefersReducedMotionRef = useRef(false);
  const bubbleNodes = useMemo(() => createBubbleNodes(keywords), [keywords]);
  const bubbleSignature = bubbleNodes
    .map(({ frequency, id, importance }) => `${id}:${frequency}:${importance}`)
    .join('|');

  useEffect(() => {
    let enterAnimationFrame = 0;
    const resetAnimationFrame = window.requestAnimationFrame(() => {
      setIsEntryAnimationActive(false);
      enterAnimationFrame = window.requestAnimationFrame(() => setIsEntryAnimationActive(true));
    });

    return () => {
      window.cancelAnimationFrame(resetAnimationFrame);
      window.cancelAnimationFrame(enterAnimationFrame);
    };
  }, [bubbleSignature]);

  const getPointerPositionInViewBox = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const svg = svgRef.current;

    if (!svg) return null;

    const bounds = svg.getBoundingClientRect();

    return {
      x: ((event.clientX - bounds.left) / bounds.width) * KEYWORD_BUBBLE_VIEWBOX.width,
      y: ((event.clientY - bounds.top) / bounds.height) * KEYWORD_BUBBLE_VIEWBOX.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<SVGGElement>) => {
      const id = event.currentTarget.dataset.bubbleId;
      const node = nodesRef.current.find((candidate) => candidate.id === id);
      const pointerPosition = getPointerPositionInViewBox(event);

      if (!node || !pointerPosition) return;

      event.preventDefault();
      setActiveTooltip(null);
      event.currentTarget.setPointerCapture(event.pointerId);
      const clampedPosition = clampBubblePosition(pointerPosition, node.radius);

      node.fx = clampedPosition.x;
      node.fy = clampedPosition.y;
      activeDragRef.current = {
        id: node.id,
        pointerId: event.pointerId,
        previousX: node.fx,
        previousY: node.fy,
        velocityX: 0,
        velocityY: 0,
      };

      if (!prefersReducedMotionRef.current) {
        simulationRef.current?.alphaTarget(KEYWORD_BUBBLE_PHYSICS.dragAlphaTarget).restart();
      }
    },
    [getPointerPositionInViewBox]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGGElement>) => {
      const activeDrag = activeDragRef.current;
      const pointerPosition = getPointerPositionInViewBox(event);

      if (!activeDrag || activeDrag.pointerId !== event.pointerId || !pointerPosition) return;

      const node = nodesRef.current.find((candidate) => candidate.id === activeDrag.id);

      if (!node) return;

      event.preventDefault();
      const { x: nextX, y: nextY } = clampBubblePosition(pointerPosition, node.radius);

      activeDrag.velocityX = Math.max(
        -KEYWORD_BUBBLE_PHYSICS.maxThrowVelocity,
        Math.min(
          KEYWORD_BUBBLE_PHYSICS.maxThrowVelocity,
          (nextX - activeDrag.previousX) * KEYWORD_BUBBLE_PHYSICS.throwVelocityScale
        )
      );
      activeDrag.velocityY = Math.max(
        -KEYWORD_BUBBLE_PHYSICS.maxThrowVelocity,
        Math.min(
          KEYWORD_BUBBLE_PHYSICS.maxThrowVelocity,
          (nextY - activeDrag.previousY) * KEYWORD_BUBBLE_PHYSICS.throwVelocityScale
        )
      );
      activeDrag.previousX = nextX;
      activeDrag.previousY = nextY;
      node.fx = nextX;
      node.fy = nextY;

      if (prefersReducedMotionRef.current) {
        node.x = nextX;
        node.y = nextY;
        bubblePositionsRef.current.set(node.id, { x: nextX, y: nextY });
        bubbleElementsRef.current
          .get(node.id)
          ?.setAttribute('transform', `translate(${nextX}, ${nextY})`);
      }
    },
    [getPointerPositionInViewBox]
  );

  const handlePointerRelease = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const activeDrag = activeDragRef.current;

    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

    const node = nodesRef.current.find((candidate) => candidate.id === activeDrag.id);

    if (node) {
      node.fx = null;
      node.fy = null;
      node.vx = activeDrag.velocityX;
      node.vy = activeDrag.velocityY;
    }

    activeDragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!prefersReducedMotionRef.current) {
      simulationRef.current?.alphaTarget(0).alpha(KEYWORD_BUBBLE_PHYSICS.releaseAlpha).restart();
    }
  }, []);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<SVGGElement>) => {
      const id = event.currentTarget.dataset.bubbleId;
      const node = nodesRef.current.find((candidate) => candidate.id === id);
      const pointerPosition = getPointerPositionInViewBox(event);

      if (!node || !pointerPosition || activeDragRef.current) return;

      const placement = pointerPosition.y < TOOLTIP_VERTICAL_EDGE_THRESHOLD ? 'bottom' : 'top';

      setActiveTooltip({
        id: node.id,
        importance: node.importance,
        keyword: node.keyword,
        placement,
        x: Math.max(
          TOOLTIP_HORIZONTAL_BOUNDARY_PADDING,
          Math.min(
            KEYWORD_BUBBLE_VIEWBOX.width - TOOLTIP_HORIZONTAL_BOUNDARY_PADDING,
            pointerPosition.x
          )
        ),
        y: pointerPosition.y + (placement === 'bottom' ? TOOLTIP_OFFSET : -TOOLTIP_OFFSET),
      });
    },
    [getPointerPositionInViewBox]
  );

  const handlePointerLeave = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const id = event.currentTarget.dataset.bubbleId;

    setActiveTooltip((currentTooltip) => (currentTooltip?.id === id ? null : currentTooltip));
  }, []);

  const registerBubbleElement = useCallback((id: string, element: SVGGElement | null) => {
    if (element) {
      bubbleElementsRef.current.set(id, element);
    } else {
      bubbleElementsRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const activeBubbleIds = new Set(bubbleNodes.map(({ id }) => id));

    bubblePositionsRef.current.forEach((_, id) => {
      if (!activeBubbleIds.has(id)) bubblePositionsRef.current.delete(id);
    });

    const tooltipResetFrame = window.requestAnimationFrame(() => setActiveTooltip(null));

    return () => window.cancelAnimationFrame(tooltipResetFrame);
  }, [bubbleNodes]);

  useEffect(() => {
    if (bubbleNodes.length === 0) return;

    const nodes = bubbleNodes.map((node) => {
      const previousPosition = bubblePositionsRef.current.get(node.id);

      return previousPosition ? { ...node, ...previousPosition, vx: 0, vy: 0 } : { ...node };
    });
    const updateBubblePositions = () => {
      nodes.forEach(
        ({ id, x = KEYWORD_BUBBLE_VIEWBOX.width / 2, y = KEYWORD_BUBBLE_VIEWBOX.height / 2 }) => {
          bubblePositionsRef.current.set(id, { x, y });
          bubbleElementsRef.current.get(id)?.setAttribute('transform', `translate(${x}, ${y})`);
        }
      );
    };
    const simulation = forceSimulation(nodes)
      .alpha(KEYWORD_BUBBLE_PHYSICS.initialAlpha)
      .alphaMin(KEYWORD_BUBBLE_PHYSICS.minimumAlpha)
      .alphaDecay(KEYWORD_BUBBLE_PHYSICS.alphaDecay)
      .velocityDecay(KEYWORD_BUBBLE_PHYSICS.velocityDecay)
      .force(
        'charge',
        forceManyBody<KeywordBubbleNode>().strength(KEYWORD_BUBBLE_PHYSICS.chargeStrength)
      )
      .force(
        'collision',
        forceCollide<KeywordBubbleNode>(
          ({ radius }) => radius + KEYWORD_BUBBLE_PHYSICS.collisionPadding
        )
          .strength(KEYWORD_BUBBLE_PHYSICS.collisionStrength)
          .iterations(KEYWORD_BUBBLE_PHYSICS.collisionIterations)
      )
      .force(
        'x',
        forceX<KeywordBubbleNode>(KEYWORD_BUBBLE_VIEWBOX.width / 2).strength(
          KEYWORD_BUBBLE_PHYSICS.xForceStrength
        )
      )
      .force(
        'y',
        forceY<KeywordBubbleNode>(KEYWORD_BUBBLE_VIEWBOX.height / 2).strength(
          KEYWORD_BUBBLE_PHYSICS.yForceStrength
        )
      )
      .force('boundary', createBoundaryForce())
      .on('tick', updateBubblePositions);
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    prefersReducedMotionRef.current = prefersReducedMotion;
    nodesRef.current = nodes;
    simulationRef.current = simulation;

    if (prefersReducedMotion) {
      simulation.stop();
      simulation.tick(KEYWORD_BUBBLE_PHYSICS.reducedMotionTickCount);
      updateBubblePositions();
    }

    return () => {
      simulation.stop();
      nodesRef.current = [];
      simulationRef.current = null;
      activeDragRef.current = null;
      prefersReducedMotionRef.current = false;
    };
  }, [bubbleNodes]);

  return {
    activeTooltip,
    bubbleNodes,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    handlePointerRelease,
    isEntryAnimationActive,
    registerBubbleElement,
    svgRef,
  };
}
