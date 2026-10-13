export class EventStreamHttpError extends Error {
  constructor(readonly status: number) {
    super(`SSE 요청에 실패했습니다. (${status})`);
    this.name = 'EventStreamHttpError';
  }
}

export class EventStreamProtocolError extends Error {
  constructor() {
    super('SSE 응답의 Content-Type이 text/event-stream이 아닙니다.');
    this.name = 'EventStreamProtocolError';
  }
}

export class EventStreamHandlerError extends Error {
  constructor(readonly originalError: unknown) {
    super('SSE 이벤트 처리 중 오류가 발생했습니다.');
    this.name = 'EventStreamHandlerError';
  }
}

export class AuthRefreshError extends Error {
  constructor(readonly originalError: unknown) {
    super('SSE 재연결을 위한 인증 갱신에 실패했습니다.');
    this.name = 'AuthRefreshError';
  }
}
