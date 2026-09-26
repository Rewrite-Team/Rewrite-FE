import { getMockCoverLetterDetail, type CoverLetterDetail } from '@/entities/cover-letter';
import type { ReviewVersionSummary } from '@/entities/review-version';

export interface CoverLetterVersionRecord {
  detail: CoverLetterDetail;
  versionId: string;
}

export const getMockReviewVersions = (writingId: string): ReviewVersionSummary[] => [
  {
    id: `${writingId}-v001`,
    label: 'V.0.1',
    createdAt: '2026-05-20T14:00:00',
    status: 'COMPLETED',
  },
  {
    id: `${writingId}-v002`,
    label: 'V.0.2',
    createdAt: '2026-05-22T10:30:00',
    status: 'COMPLETED',
  },
  {
    id: `${writingId}-v003`,
    label: 'V.0.3',
    createdAt: '2026-05-22T11:10:00',
    status: 'GENERATING',
  },
];

export const getMockCoverLetterVersionRecords = (writingId: string): CoverLetterVersionRecord[] => {
  const currentDetail = getMockCoverLetterDetail(writingId);

  return [
    {
      versionId: `${writingId}-v001`,
      detail: {
        ...currentDetail,
        version: 'V.0.1',
        questions: currentDetail.questions.map((question) => ({
          ...question,
          aiReport:
            '핵심 경험은 잘 드러나지만 지원 직무와 연결되는 구체적인 근거를 보강하면 설득력이 높아집니다.',
          reviewedAnswer: question.originalAnswer,
          finalAnswer: question.originalAnswer,
        })),
      },
    },
    {
      versionId: `${writingId}-v002`,
      detail: {
        ...currentDetail,
        version: 'V.0.2',
      },
    },
  ];
};
