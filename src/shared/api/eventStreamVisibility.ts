/**
 * 탭이 보이는 동안 SSE 구독 하나를 유지합니다.
 * 숨겨지면 구독을 취소하고, 복귀 시 다시 생성하며 최종 종료에는 리스너를 정리합니다.
 *
 * @param signal - 화면 이탈 등 전체 구독 수명을 종료하는 신호입니다.
 * @param subscribe - 전달된 신호가 abort되면 연결과 재시도 타이머를 정리하는 구독 함수입니다.
 * @returns 정상 종료·외부 abort 시 완료되고, 활성 구독의 최종 오류 시 거부됩니다.
 */
export const runVisibleEventStream = (
  signal: AbortSignal,
  subscribe: (signal: AbortSignal) => Promise<void>
): Promise<void> => {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let activeController: AbortController | undefined;

    const stopSubscription = () => {
      const controller = activeController;
      activeController = undefined;
      controller?.abort();
    };

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      signal.removeEventListener('abort', handleAbort);
      stopSubscription();
    };

    const handleAbort = () => {
      cleanup();
      resolve();
    };

    const startSubscription = () => {
      if (signal.aborted || document.hidden || activeController) {
        return;
      }

      const controller = new AbortController();
      activeController = controller;
      // 숨겨져 취소된 이전 구독의 종료가 새 구독을 정리하지 않도록 구분합니다.
      void subscribe(controller.signal).then(
        () => {
          if (activeController !== controller) {
            return;
          }
          cleanup();
          resolve();
        },
        (error: unknown) => {
          if (activeController !== controller) {
            return;
          }
          cleanup();
          reject(error);
        }
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopSubscription();
      } else {
        startSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    signal.addEventListener('abort', handleAbort, { once: true });
    if (signal.aborted) {
      handleAbort();
    } else {
      startSubscription();
    }
  });
};
