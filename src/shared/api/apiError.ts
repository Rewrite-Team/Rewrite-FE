/** API 오류 응답의 `details` 배열에 담기는 필드별 검증 오류입니다. */
export interface ApiErrorDetail {
  /** 오류가 발생한 요청 필드 이름입니다. */
  field?: string;
  /** 해당 필드의 오류 원인입니다. */
  reason?: string;
}

interface ApiErrorBody {
  code?: string;
  details?: ApiErrorDetail[];
  message?: string;
}

interface ApiErrorResponse {
  error?: ApiErrorBody;
}

/**
 * ## ApiError
 *
 * @description
 * API의 HTTP 상태와 JSON 오류 응답 정보를 함께 보존하는 오류입니다.
 * 공통 요청 함수가 실패 응답을 처리할 때 발생하며, `code`와 `details`로 오류 유형과 필드별 원인을 확인할 수 있습니다.
 *
 * @example
 * ```ts
 * const error = new ApiError(400, {
 *   error: {
 *     code: 'VALIDATION_ERROR',
 *     message: '입력값을 확인해주세요.',
 *     details: [{ field: 'email', reason: '이메일 형식이 올바르지 않습니다.' }],
 *   },
 * });
 * console.error(error.status, error.code, error.details);
 * ```
 */
export class ApiError extends Error {
  /** 백엔드 오류 코드입니다. 오류 본문이 없으면 `undefined`입니다. */
  readonly code?: string;
  /** 백엔드가 반환한 필드별 오류 목록입니다. */
  readonly details: ApiErrorDetail[];
  /** HTTP 응답 상태 코드입니다. */
  readonly status: number;

  /**
   * @param status - 서버가 반환한 HTTP 상태 코드입니다.
   * @param response - 백엔드 오류 JSON 응답 본문입니다.
   */
  constructor(status: number, response?: unknown) {
    const apiResponse =
      typeof response === 'object' && response !== null
        ? (response as ApiErrorResponse)
        : undefined;
    const error = apiResponse?.error;

    super(error?.message ?? `API 요청에 실패했습니다. (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = error?.code;
    this.details = error?.details ?? [];
  }
}
