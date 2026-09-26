import { fireEvent, render, screen } from '@testing-library/react';

import {
  ReviewVersionProvider,
  useReviewVersion,
} from '@/features/review-version/version-management';
import type { CoverLetterVersionRecord } from '@/features/review-version/version-management';

import { CoverLetterVersionDetail } from './CoverLetterVersionDetail';

jest.mock('@/shared/assets/icons/common', () => ({
  AltArrowDownIcon: 'svg',
  EditIcon: 'svg',
}));

const records: CoverLetterVersionRecord[] = [
  {
    versionId: 'v1',
    detail: {
      id: 'cover-letter-1',
      title: '자기소개서',
      companyName: '회사',
      positionTitle: '직무',
      version: 'V.0.1',
      questions: [
        {
          id: 'q1',
          question: '첫 질문',
          characterLimit: 700,
          originalAnswer: '원문',
          aiReport: '첫 리포트',
          reviewedAnswer: '첫 첨삭',
          finalAnswer: '첫 최종본',
        },
      ],
    },
  },
  {
    versionId: 'v2',
    detail: {
      id: 'cover-letter-1',
      title: '자기소개서',
      companyName: '회사',
      positionTitle: '직무',
      version: 'V.0.2',
      questions: [
        {
          id: 'q1',
          question: '첫 질문',
          characterLimit: 700,
          originalAnswer: '원문',
          aiReport: '두 번째 리포트',
          reviewedAnswer: '두 번째 첨삭',
          finalAnswer: '두 번째 최종본',
        },
      ],
    },
  },
];

function VersionSwitcher() {
  return (
    <ReviewVersionProvider
      editableVersionId="v2"
      initialSelectedVersionId="v1"
      versions={[
        { id: 'v1', label: 'V.0.1', createdAt: '2026-05-20T14:00:00', status: 'COMPLETED' },
        { id: 'v2', label: 'V.0.2', createdAt: '2026-05-21T14:00:00', status: 'COMPLETED' },
      ]}
    >
      <VersionSelectionButton />
      <CoverLetterVersionDetail records={records} />
    </ReviewVersionProvider>
  );
}

function VersionSelectionButton() {
  const { selectVersion } = useReviewVersion();

  return <button onClick={() => selectVersion('v2')}>두 번째 버전 보기</button>;
}

describe('CoverLetterVersionDetail', () => {
  it('선택한 버전의 헤더와 내용을 함께 표시한다', () => {
    render(<VersionSwitcher />);

    expect(screen.getByText('V.0.1')).toBeInTheDocument();
    expect(screen.getByText('첫 리포트')).toBeInTheDocument();
    expect(screen.getByText('이전 버전은 읽기 전용입니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '최종 작성본 편집' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '두 번째 버전 보기' }));

    expect(screen.getByText('V.0.2')).toBeInTheDocument();
    expect(screen.getByText('두 번째 리포트')).toBeInTheDocument();
    expect(screen.queryByText('첫 리포트')).not.toBeInTheDocument();
    expect(screen.queryByText('이전 버전은 읽기 전용입니다.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '최종 작성본 편집' })).toBeInTheDocument();
  });
});
