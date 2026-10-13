export const INITIAL_RETRY_DELAY_MS = 2000;
export const DEFAULT_MAX_RETRY_DELAY_MS = 60_000;

const RETRY_DELAY_MULTIPLIER = 2;
const MIN_RETRY_DELAY_RATIO = 0.5;

/** 실제 대기는 기준 간격의 50~100%로 분산하고, 다음 기준 간격은 상한 내에서 두 배로 늘립니다. */
export const getEventStreamBackoff = (retryDelayMs: number, maxRetryDelayMs: number) => ({
  delayMs: Math.floor(
    retryDelayMs * (MIN_RETRY_DELAY_RATIO + Math.random() * (1 - MIN_RETRY_DELAY_RATIO))
  ),
  nextRetryDelayMs: Math.min(retryDelayMs * RETRY_DELAY_MULTIPLIER, maxRetryDelayMs),
});
