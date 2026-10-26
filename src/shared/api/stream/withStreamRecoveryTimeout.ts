const STREAM_RECOVERY_TIMEOUT_MS = 15_000;

/**
 * SSE 복구 조회에 15초 제한을 적용합니다. 구독 취소도 요청에 전달하고, 완료 시 타이머와 리스너를 정리합니다.
 * recover는 전달받은 signal로 실제 fetch 또는 TanStack Query를 취소해야 합니다.
 * 제한 시간과 구독 취소 시 실제 요청의 signal과 복구 대기를 함께 종료합니다.
 * 개별 요청의 취소를 반영하지 않는 공유 인증 갱신을 기다려도 복구가 무기한 멈추지 않습니다.
 */
export const withStreamRecoveryTimeout = async <T>(
  signal: AbortSignal,
  recover: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  signal.throwIfAborted();
  const controller = new AbortController();
  let rejectAbort: (reason: unknown) => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const abortRecovery = (reason: unknown) => {
    controller.abort(reason);
    rejectAbort(reason);
  };
  const handleAbort = () => abortRecovery(signal.reason);
  signal.addEventListener('abort', handleAbort, { once: true });
  const timer = window.setTimeout(() => {
    abortRecovery(new DOMException('상태 복구 요청 시간이 초과되었습니다.', 'TimeoutError'));
  }, STREAM_RECOVERY_TIMEOUT_MS);

  try {
    const result = await Promise.race([recover(controller.signal), aborted]);
    // 쿼리 취소를 성공으로 반환하는 호출부에서도 시간 초과를 실패로 처리합니다.
    controller.signal.throwIfAborted();
    return result;
  } catch (error) {
    // TanStack Query의 취소 오류가 먼저 도착해도 호출부에는 시간 초과 원인을 유지합니다.
    controller.signal.throwIfAborted();
    throw error;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener('abort', handleAbort);
  }
};
