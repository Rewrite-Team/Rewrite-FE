export type ReviewVersionStatus = 'COMPLETED' | 'GENERATING' | 'FAILED';

export interface ReviewVersionSummary {
  id: string;
  label: string;
  createdAt: string;
  status: ReviewVersionStatus;
}
