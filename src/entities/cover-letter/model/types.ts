export type CoverLetterDisplayStatus = 'WRITING' | 'REVIEWING' | 'REVIEWED' | 'REVIEW_FAILED';

export interface CoverLetterSummary {
  id: string;
  title: string;
  companyName: string;
  positionTitle: string;
  displayStatus: CoverLetterDisplayStatus;
  createdAt: string;
  latestReviewedVersionId: string | null;
}
