const REFRESH_RETRY_DELAY_MS = 3000;

/** 3초 후 true를 반환하며, 화면 이탈 시 대기를 취소하고 false를 반환합니다. */
export const waitForRefreshRetry = (signal: AbortSignal) =>
  new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', handleAbort);
      resolve(false);
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve(true);
    }, REFRESH_RETRY_DELAY_MS);
    signal.addEventListener('abort', handleAbort, { once: true });
  });
