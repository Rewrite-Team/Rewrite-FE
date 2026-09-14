/** 면접 API 연결 전 세션 화면에서 사용하는 대화 메시지 형태입니다. */
export interface InterviewMessage {
  id: number;
  content: string;
  recordingId?: string;
  role: 'assistant' | 'user';
}

/** 하나의 면접 질문과 해당 질문에 종속된 대화 내역을 표현합니다. */
export interface InterviewQuestion {
  id: number;
  prompt: string;
  messages: InterviewMessage[];
}

/** 새로고침 후 복원하기 위해 IndexedDB에 저장하는 면접 세션 스냅샷입니다. */
export interface InterviewSessionSnapshot {
  activeQuestionId: number;
  questions: InterviewQuestion[];
  updatedAt: number;
  version: 1;
  writingId: string;
}

/** 채팅 메시지에서 원본 음성을 다시 재생하기 위해 저장하는 녹음 데이터입니다. */
export interface InterviewRecordingData {
  audioBlob: Blob;
  createdAt: number;
  durationMs: number;
  id: string;
  messageId: number;
  mimeType: string;
  questionId: number;
  writingId: string;
}
