import { withStreamRecoveryTimeout } from './withStreamRecoveryTimeout';

describe('withStreamRecoveryTimeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const waitForAbort = (signal: AbortSignal) =>
    new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });

  it('15초 뒤 실제 요청의 signal을 취소하고 복구 대기를 종료한다', async () => {
    const recovery = withStreamRecoveryTimeout(new AbortController().signal, waitForAbort);
    const outcome = recovery.catch((error: unknown) => error);
    await jest.advanceTimersByTimeAsync(15_000);
    expect(await outcome).toMatchObject({ name: 'TimeoutError' });
    expect(jest.getTimerCount()).toBe(0);
  });

  it('구독 취소를 요청에 전달하고 남은 타이머를 정리한다', async () => {
    const controller = new AbortController();
    const recovery = withStreamRecoveryTimeout(controller.signal, waitForAbort);
    const outcome = recovery.catch((error: unknown) => error);
    controller.abort();
    expect(await outcome).toMatchObject({ name: 'AbortError' });
    expect(jest.getTimerCount()).toBe(0);
  });

  it('정상 완료한 요청을 나중에 시간 초과로 취소하지 않는다', async () => {
    let requestSignal: AbortSignal | undefined;
    await expect(
      withStreamRecoveryTimeout(new AbortController().signal, async (signal) => {
        requestSignal = signal;
        return 'recovered';
      })
    ).resolves.toBe('recovered');
    expect(jest.getTimerCount()).toBe(0);
    jest.advanceTimersByTime(15_000);
    expect(requestSignal?.aborted).toBe(false);
  });
});
