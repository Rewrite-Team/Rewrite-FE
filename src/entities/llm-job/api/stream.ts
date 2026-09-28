/** SSE 연결에서 사용하는 LLM Job 이벤트 스트림 경로를 반환합니다. */
export const getStreamLlmJobEventsUrl = (jobId: string) => `/llm-jobs/${jobId}/stream`;
