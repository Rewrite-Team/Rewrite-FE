export const KEYWORD_BUBBLE_ENTRY_STAGGER_MS = 25;
export const KEYWORD_BUBBLE_LABEL_LINE_HEIGHT_RATIO = 1.12;
export const KEYWORD_BUBBLE_MAX_COUNT = 20;

export const KEYWORD_BUBBLE_VIEWBOX = {
  height: 360,
  width: 480,
} as const;

export const KEYWORD_BUBBLE_RADIUS = {
  max: 56,
  min: 24,
  scaleExponent: 1.45,
} as const;

export const KEYWORD_BUBBLE_INITIAL_LAYOUT = {
  goldenAngleRadians: Math.PI * (3 - Math.sqrt(5)),
  horizontalDistance: {
    base: 110,
    step: 24,
    variantCount: 3,
  },
  velocity: {
    variantCount: 3,
    xBase: 0.45,
    xStep: 0.16,
    yBase: 0.4,
    yStep: 0.14,
  },
  verticalDistance: {
    base: 72,
    step: 14,
    variantCount: 4,
  },
} as const;
