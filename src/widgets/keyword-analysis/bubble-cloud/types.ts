import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import type { SimulationNodeDatum } from 'd3-force';

interface KeywordBubbleNode extends SimulationNodeDatum, KeywordAnalysisKeyword {
  displayLines: string[];
  id: string;
  radius: number;
  fill: string;
  stroke: string;
  textColor: string;
  fontSize: number;
}

interface KeywordBubbleBounds {
  height: number;
  width: number;
}

interface KeywordBubbleTooltipState {
  id: string;
  importance: number;
  keyword: string;
  placement: 'top' | 'bottom';
  x: number;
  y: number;
}

export type { KeywordBubbleBounds, KeywordBubbleNode, KeywordBubbleTooltipState };
