/** 면접 API 연결 전 세션 화면의 컴포넌트들이 공유하는 대화 메시지 형태입니다. */
export interface InterviewMessage {
  id: number;
  content: string;
  role: 'assistant' | 'user';
}

/** 하나의 면접 질문과 해당 질문에 종속된 대화 내역을 묶는 세션 화면 모델입니다. */
export interface InterviewQuestion {
  id: number;
  prompt: string;
  messages: InterviewMessage[];
}
