import type { CoverLetterDetailResponse } from '@/entities/cover-letter';
import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterReviewQuestion } from './CoverLetterReviewQuestion';

interface CoverLetterReviewResultProps {
  detail: CoverLetterDetailResponse;
}

/** 선택한 첨삭 버전의 기본 정보와 완료된 문항을 표시합니다. */
export function CoverLetterReviewResult({ detail }: CoverLetterReviewResultProps) {
  return (
    <section className="writing-detail-content">
      <PageHeader
        className="mb-10"
        title={detail.coverLetter.title ?? '자기소개서'}
        version={detail.reviewVersion?.version}
        eyebrow={
          <BadgeGroup
            companyName={detail.coverLetter.companyName ?? ''}
            jobName={detail.coverLetter.positionTitle ?? ''}
          />
        }
      />
      <div className="flex flex-col gap-15">
        {[...detail.questions]
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <CoverLetterReviewQuestion
              key={question.questionId}
              question={question}
              questionNumber={index + 1}
            />
          ))}
      </div>
    </section>
  );
}
