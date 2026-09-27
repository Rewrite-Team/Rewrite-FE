/** 버전 생성 작업의 완료 여부와 실패 상태를 나타냅니다. */
export type ReviewVersionStatus = 'COMPLETED' | 'GENERATING' | 'FAILED';

/** 버전 관리 목록에 표시하는 자기소개서 버전 요약 정보입니다. */
export interface ReviewVersionSummary {
  id: string;
  label: string;
  createdAt: string;
  status: ReviewVersionStatus;
}
