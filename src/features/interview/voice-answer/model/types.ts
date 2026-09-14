/** 브라우저 음성 입력의 권한 요청부터 변환 완료까지의 상태입니다. */
export type InterviewRecordingStatus = 'idle' | 'processing' | 'recording' | 'requesting';

/** 녹음 완료 후 채팅 메시지와 로컬 저장소에 연결할 음성 결과입니다. */
export interface CompletedInterviewRecording {
  audioBlob: Blob;
  durationMs: number;
  transcript: string;
}
