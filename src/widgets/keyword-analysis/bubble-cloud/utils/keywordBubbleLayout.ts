import type { KeywordAnalysisKeyword } from '@/entities/keyword-analysis';

import {
  KEYWORD_BUBBLE_INITIAL_LAYOUT,
  KEYWORD_BUBBLE_MAX_COUNT,
  KEYWORD_BUBBLE_RADIUS,
  KEYWORD_BUBBLE_VIEWBOX,
} from '../constants';

import type { KeywordBubbleNode } from '../types';

interface BubbleColor {
  fill: string;
  stroke: string;
  textColor: string;
}

const SIMULATION_PRECISION = 10_000;
const MIN_LABEL_FONT_SIZE = 8;
const MIN_SINGLE_LINE_FONT_SIZE = 10.5;
const MAX_LABEL_FONT_SIZE = 17;
const LABEL_WIDTH_RATIO = 1.55;
const LABEL_WIDTH_TOLERANCE = 0.02;
const SHORT_LABEL_WIDTH_UNITS = 4;

const BUBBLE_COLOR_PALETTE: BubbleColor[] = [
  {
    fill: 'var(--color-keyword-blue-fill)',
    stroke: 'var(--color-keyword-blue-stroke)',
    textColor: 'var(--color-keyword-blue-text)',
  },
  {
    fill: 'var(--color-keyword-teal-fill)',
    stroke: 'var(--color-keyword-teal-stroke)',
    textColor: 'var(--color-keyword-teal-text)',
  },
  {
    fill: 'var(--color-keyword-indigo-fill)',
    stroke: 'var(--color-keyword-indigo-stroke)',
    textColor: 'var(--color-keyword-indigo-text)',
  },
  {
    fill: 'var(--color-keyword-green-fill)',
    stroke: 'var(--color-keyword-green-stroke)',
    textColor: 'var(--color-keyword-green-text)',
  },
  {
    fill: 'var(--color-keyword-violet-fill)',
    stroke: 'var(--color-keyword-violet-stroke)',
    textColor: 'var(--color-keyword-violet-text)',
  },
  {
    fill: 'var(--color-keyword-steel-fill)',
    stroke: 'var(--color-keyword-steel-stroke)',
    textColor: 'var(--color-keyword-steel-text)',
  },
  {
    fill: 'var(--color-keyword-sage-fill)',
    stroke: 'var(--color-keyword-sage-stroke)',
    textColor: 'var(--color-keyword-sage-text)',
  },
  {
    fill: 'var(--color-keyword-neutral-fill)',
    stroke: 'var(--color-keyword-neutral-stroke)',
    textColor: 'var(--color-keyword-neutral-text)',
  },
];

/**
 * 시뮬레이션에서 사용하는 숫자를 고정된 정밀도로 반올림합니다.
 *
 * @param value - 반올림할 숫자입니다.
 * @returns 시뮬레이션 정밀도에 맞춰 반올림한 숫자입니다.
 */
export const roundToSimulationPrecision = (value: number) =>
  Math.round(value * SIMULATION_PRECISION) / SIMULATION_PRECISION;

/** 키워드 중요도를 설정된 반지름 범위로 변환합니다. */
const getBubbleRadius = (importance: number, minImportance: number, maxImportance: number) => {
  const { max, min, scaleExponent } = KEYWORD_BUBBLE_RADIUS;

  if (minImportance === maxImportance) return (min + max) / 2;

  const normalizedImportance = (importance - minImportance) / (maxImportance - minImportance);

  return min + Math.pow(normalizedImportance, scaleExponent) * (max - min);
};

/** 문자 종류별 예상 너비를 합산해 SVG 라벨의 상대 너비를 계산합니다. */
const getKeywordWidthUnits = (keyword: string) =>
  Array.from(keyword).reduce((width, character) => {
    if (/\s/.test(character)) return width + 0.35;
    if (/^[\u0020-\u007e]$/.test(character)) return width + 0.58;

    return width + 1;
  }, 0);

/** 한 줄 라벨이 버블 안에 들어가도록 글자 크기를 계산합니다. */
const getSingleLineFontSize = (keyword: string, radius: number) => {
  const sizeForRadius = radius * 0.38;
  const sizeForTextLength =
    (radius * LABEL_WIDTH_RATIO) / Math.max(getKeywordWidthUnits(keyword), 1);

  return Math.min(MAX_LABEL_FONT_SIZE, sizeForRadius, sizeForTextLength);
};

/** 두 줄의 예상 너비가 가장 비슷해지는 지점을 찾아 키워드를 분리합니다. */
const splitKeywordIntoLines = (keyword: string) => {
  const characters = Array.from(keyword);
  let bestLines = [keyword];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = 1; index < characters.length; index += 1) {
    const firstLine = characters.slice(0, index).join('').trim();
    const secondLine = characters.slice(index).join('').trim();

    if (!firstLine || !secondLine) continue;

    const isWordBoundary =
      /\s/.test(characters[index - 1] ?? '') || /\s/.test(characters[index] ?? '');
    const score =
      Math.abs(getKeywordWidthUnits(firstLine) - getKeywordWidthUnits(secondLine)) -
      (isWordBoundary ? 0.75 : 0);

    if (score < bestScore) {
      bestLines = [firstLine, secondLine];
      bestScore = score;
    }
  }

  return bestLines;
};

/** 주어진 예상 너비를 초과하는 라벨을 말줄임표와 함께 줄입니다. */
const truncateKeywordLine = (keyword: string, maxWidthUnits: number) => {
  if (getKeywordWidthUnits(keyword) <= maxWidthUnits + LABEL_WIDTH_TOLERANCE) return keyword;

  const ellipsis = '…';
  let displayKeyword = '';

  for (const character of Array.from(keyword)) {
    if (
      getKeywordWidthUnits(`${displayKeyword}${character}${ellipsis}`) >
      maxWidthUnits + LABEL_WIDTH_TOLERANCE
    )
      break;
    displayKeyword += character;
  }

  return `${displayKeyword.trimEnd()}${ellipsis}`;
};

/** 키워드 길이와 버블 반지름에 맞는 한 줄 또는 두 줄 라벨 배치를 계산합니다. */
const getLabelLayout = (keyword: string, radius: number) => {
  const singleLineFontSize = getSingleLineFontSize(keyword, radius);

  if (
    getKeywordWidthUnits(keyword) <= SHORT_LABEL_WIDTH_UNITS ||
    singleLineFontSize >= MIN_SINGLE_LINE_FONT_SIZE
  ) {
    return {
      fontSize: roundToSimulationPrecision(Math.max(MIN_LABEL_FONT_SIZE, singleLineFontSize)),
      lines: [keyword],
    };
  }

  const lines = splitKeywordIntoLines(keyword);
  const widestLine = Math.max(...lines.map(getKeywordWidthUnits));
  const twoLineFontSize = Math.min(
    MAX_LABEL_FONT_SIZE,
    radius * 0.36,
    (radius * LABEL_WIDTH_RATIO) / Math.max(widestLine, 1)
  );
  const fontSize = roundToSimulationPrecision(Math.max(MIN_LABEL_FONT_SIZE, twoLineFontSize));
  const maxWidthUnits = (radius * LABEL_WIDTH_RATIO) / fontSize;

  return {
    fontSize,
    lines: lines.map((line) => truncateKeywordLine(line, maxWidthUnits)),
  };
};

/**
 * 키워드 분석 결과를 렌더링과 D3 force 시뮬레이션에 사용할 버블 노드로 변환합니다.
 *
 * @remarks
 * 입력 순서를 유지하며 최대 허용 개수까지만 변환합니다.
 * 중요도 범위를 반지름 범위에 매핑하고 황금각 기반의 초기 좌표를 생성합니다.
 *
 * @param keywords - 변환할 키워드 분석 결과입니다.
 * @returns 색상, 라벨 배치, 반지름과 초기 물리 상태가 포함된 버블 노드 목록입니다.
 */
export const createBubbleNodes = (keywords: KeywordAnalysisKeyword[]): KeywordBubbleNode[] => {
  const limitedKeywords = keywords.slice(0, KEYWORD_BUBBLE_MAX_COUNT);

  if (limitedKeywords.length === 0) return [];

  const importanceValues = limitedKeywords.map(({ importance }) => importance);
  const minImportance = Math.min(...importanceValues);
  const maxImportance = Math.max(...importanceValues);
  const centerX = KEYWORD_BUBBLE_VIEWBOX.width / 2;
  const centerY = KEYWORD_BUBBLE_VIEWBOX.height / 2;
  const { goldenAngleRadians, horizontalDistance, velocity, verticalDistance } =
    KEYWORD_BUBBLE_INITIAL_LAYOUT;

  return limitedKeywords.map(({ frequency, importance, keyword }, index) => {
    const radius = roundToSimulationPrecision(
      getBubbleRadius(importance, minImportance, maxImportance)
    );
    const angle = index * goldenAngleRadians;
    const initialHorizontalDistance =
      horizontalDistance.base + (index % horizontalDistance.variantCount) * horizontalDistance.step;
    const initialVerticalDistance =
      verticalDistance.base + (index % verticalDistance.variantCount) * verticalDistance.step;
    const velocityVariantIndex = index % velocity.variantCount;
    const color = BUBBLE_COLOR_PALETTE[index % BUBBLE_COLOR_PALETTE.length];
    const { fontSize, lines } = getLabelLayout(keyword, radius);

    return {
      displayLines: lines,
      frequency,
      importance,
      keyword,
      id: `${keyword}-${index}`,
      radius,
      fill: color.fill,
      stroke: color.stroke,
      textColor: color.textColor,
      fontSize,
      x: roundToSimulationPrecision(centerX + Math.cos(angle) * initialHorizontalDistance),
      y: roundToSimulationPrecision(centerY + Math.sin(angle) * initialVerticalDistance),
      vx: roundToSimulationPrecision(
        -Math.cos(angle) * (velocity.xBase + velocityVariantIndex * velocity.xStep)
      ),
      vy: roundToSimulationPrecision(
        -Math.sin(angle) * (velocity.yBase + velocityVariantIndex * velocity.yStep)
      ),
    };
  });
};
