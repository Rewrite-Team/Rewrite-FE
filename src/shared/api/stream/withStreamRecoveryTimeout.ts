const STREAM_RECOVERY_TIMEOUT_MS = 15_000;

/**
 * SSE 복구 조회에 15초 제한을 적용합니다. 구독 취소도 요청에 전달하고, 완료 시 타이머와 리스너를 정리합니다.
 * recover는 전달받은 signal로 실제 fetch 또는 TanStack Query를 취소해야 합니다.
 * 대기만 먼저 끝내지 않으므로 요청이 취소·완료된 뒤 다음 SSE 연결을 시작할 수 있습니다.
 */
export const withStreamRecoveryTimeout = async <T>(
  signal: AbortSignal,
  recover: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  signal.throwIfAborted();
  const controller = new AbortController();
  const handleAbort = () => controller.abort(signal.reason);
  signal.addEventListener('abort', handleAbort, { once: true });
  const timer = window.setTimeout(() => {
    controller.abort(new DOMException('상태 복구 요청 시간이 초과되었습니다.', 'TimeoutError'));
  }, STREAM_RECOVERY_TIMEOUT_MS);

  try {
    const result = await recover(controller.signal);
    // 쿼리 취소를 성공으로 반환하는 호출부에서도 시간 초과를 실패로 처리합니다.
    controller.signal.throwIfAborted();
    return result;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener('abort', handleAbort);
  }
};
