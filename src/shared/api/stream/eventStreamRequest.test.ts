import { createMonitoredStreamRequest } from './eventStreamRequest';

describe('createMonitoredStreamRequest', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('수신 시각부터 30초 동안 이벤트가 없을 때만 전송을 중단한다', () => {
    const request = createMonitoredStreamRequest(undefined, 30_000);
    request.recordActivity();
    jest.advanceTimersByTime(15_000);
    request.recordActivity();
    jest.advanceTimersByTime(29_999);
    expect(request.signal.aborted).toBe(false);
    jest.advanceTimersByTime(1);
    expect(request.signal.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('구독 취소 시 타이머를 즉시 정리하고 늦은 수신으로 다시 시작하지 않는다', () => {
    const controller = new AbortController();
    const request = createMonitoredStreamRequest(controller.signal, 30_000);
    request.recordActivity();
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
    request.recordActivity();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('숨겨진 탭에서는 지연된 타이머로 무응답을 판단하지 않는다', () => {
    jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const request = createMonitoredStreamRequest(undefined, 30_000);
    request.recordActivity();
    jest.advanceTimersByTime(60_000);
    expect(request.signal.aborted).toBe(false);
    request.dispose();
  });

  it('정상 종료나 오류 처리에서 정리하면 감시와 전송을 모두 중단한다', () => {
    const request = createMonitoredStreamRequest(undefined, 30_000);
    request.recordActivity();
    request.dispose();
    request.dispose();
    expect(request.signal.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });
});
