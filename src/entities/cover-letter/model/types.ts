export type CoverLetterDisplayStatus = 'WRITING' | 'REVIEWING' | 'REVIEWED' | 'REVIEW_FAILED';

export interface CoverLetterQuestionDetail {
  id: string;
  question: string;
  characterLimit: number;
  originalAnswer: string;
  aiReport: string;
  reviewedAnswer: string;
  finalAnswer: string;
}

export interface CoverLetterDetail {
  id: string;
  title: string;
  companyName: string;
  positionTitle: string;
  version: string;
  questions: CoverLetterQuestionDetail[];
}
