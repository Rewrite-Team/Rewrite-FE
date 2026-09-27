'use client';

import { useReviewVersion } from '@/features/review-version/version-management';
import type { CoverLetterVersionRecord } from '@/features/review-version/version-management';
import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterDetailEditor } from './CoverLetterDetailEditor';

interface CoverLetterVersionDetailProps {
  records: CoverLetterVersionRecord[];
}

/** 선택된 완료 버전에 맞춰 상세 헤더와 문항 내용을 함께 전환합니다. */
export function CoverLetterVersionDetail({ records }: CoverLetterVersionDetailProps) {
  const { editableVersionId, selectedVersionId } = useReviewVersion();
  const selectedRecord =
    records.find((record) => record.versionId === selectedVersionId) ?? records.at(-1);

  if (!selectedRecord) {
    return null;
  }

  const coverLetter = selectedRecord.detail;
  const isReadOnly = selectedVersionId !== editableVersionId;

  return (
    <section className="writing-detail-content">
      <PageHeader
        className="mb-10"
        eyebrow={
          <BadgeGroup companyName={coverLetter.companyName} jobName={coverLetter.positionTitle} />
        }
        description={isReadOnly ? '이전 버전은 읽기 전용입니다.' : undefined}
        title={coverLetter.title}
        version={coverLetter.version}
      />

      <CoverLetterDetailEditor
        key={selectedRecord.versionId}
        questions={coverLetter.questions}
        readOnly={isReadOnly}
        version={coverLetter.version}
      />
    </section>
  );
}
