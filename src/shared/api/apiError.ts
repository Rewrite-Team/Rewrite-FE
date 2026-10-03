export interface ApiErrorDetail {
  field?: string;
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

/** API의 JSON 오류 응답과 HTTP 상태를 함께 보존합니다. */
export class ApiError extends Error {
  readonly code?: string;
  readonly details: ApiErrorDetail[];
  readonly status: number;

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
