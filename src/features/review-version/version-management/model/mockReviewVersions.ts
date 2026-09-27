import { getMockCoverLetterDetail, type CoverLetterDetail } from '@/entities/cover-letter';
import type { ReviewVersionSummary } from '@/entities/review-version';

/** 목업 상세 데이터와 버전 ID를 연결하는 레코드입니다. */
export interface CoverLetterVersionRecord {
  detail: CoverLetterDetail;
  versionId: string;
}

/** 자기소개서 ID에 대응하는 시간순 버전 목록 목업을 생성합니다. */
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

/** 선택한 버전에 따라 표시할 자기소개서 상세 목업을 생성합니다. */
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
