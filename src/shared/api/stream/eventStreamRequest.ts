interface MonitoredStreamRequest {
  signal: AbortSignal;
  /** 정상 연결 직후와 이벤트 수신 시 호출해 감시를 시작하거나 수신 시각을 갱신합니다. */
  recordActivity: () => void;
  /** 반복 호출해도 안전하며 타이머·상위 abort 리스너·전송을 함께 정리합니다. */
  dispose: () => void;
}

/**
 * 실제 fetch 요청 하나의 수신 감시와 취소 신호를 관리합니다.
 * 생성만으로 타이머를 시작하지 않으며, 호출부가 정상 연결과 이벤트 수신 시 `recordActivity`를 호출합니다.
 *
 * 무응답 시 이 요청의 signal만 abort하므로 SSE 라이브러리는 전송 오류를 받아 재시도할 수 있습니다.
 * 탭 숨김·화면 이탈로 상위 구독이 abort되면 같은 정리 경로로 감시와 전송을 종료합니다.
 *
 * @param noMessageTimeoutMs - 서버 heartbeat 주기보다 길게 설정할 무응답 기준입니다.
 */
export const createMonitoredStreamRequest = (
  upstreamSignal: AbortSignal | null | undefined,
  noMessageTimeoutMs: number
): MonitoredStreamRequest => {
  const controller = new AbortController();
  let timeoutId: number | undefined;
  let timerGeneration = 0;
  let lastEventReceivedAt = 0;
  let isDisposed = false;

  const clearTimer = () => {
    timerGeneration += 1;
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const dispose = () => {
    if (isDisposed) return;
    isDisposed = true;
    clearTimer();
    upstreamSignal?.removeEventListener('abort', dispose);
    controller.abort();
  };

  const scheduleTimeout = (delayMs: number) => {
    clearTimer();
    const generation = timerGeneration;
    timeoutId = window.setTimeout(() => {
      // 취소 전에 실행 대기열에 들어간 콜백도 현재 타이머에 영향을 주지 않게 합니다.
      if (isDisposed || generation !== timerGeneration) return;
      timeoutId = undefined;
      // 숨김 시 취소와 복귀 시 새 구독 생성은 eventStreamVisibility에서 처리합니다.
      if (document.hidden) return;

      // 타이머 실행 지연과 무관하게 서버 시각이 아닌 브라우저 경과 시간으로 판단합니다.
      const remainingMs = noMessageTimeoutMs - (performance.now() - lastEventReceivedAt);
      if (remainingMs > 0) {
        scheduleTimeout(remainingMs);
        return;
      }
      dispose();
    }, delayMs);
  };

  const recordActivity = () => {
    if (isDisposed) return;
    lastEventReceivedAt = performance.now();
    scheduleTimeout(noMessageTimeoutMs);
  };

  if (upstreamSignal?.aborted) {
    dispose();
  } else {
    upstreamSignal?.addEventListener('abort', dispose, { once: true });
  }

  return { signal: controller.signal, recordActivity, dispose };
};
