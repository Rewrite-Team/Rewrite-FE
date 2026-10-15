import type { LlmJobStateResponse, ReviewQuestionSnapshot } from '@/entities/llm-job';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';

interface CoverLetterReviewProgressProps {
  title: string;
  progress?: LlmJobStateResponse['progress'];
  questionResults: ReviewQuestionSnapshot[];
  hasJobId: boolean;
  connectionIssue?: string;
  isFetching: boolean;
  onRefresh: () => void;
}

/** 첨삭 진행률, 연결 안내와 도착한 문항 결과를 표시합니다. */
export function CoverLetterReviewProgress({
  title,
  progress,
  questionResults,
  hasJobId,
  connectionIssue,
  isFetching,
  onRefresh,
}: CoverLetterReviewProgressProps) {
  return (
    <section className="writing-detail-content">
      <PageHeader title={title} description="AI가 자기소개서를 첨삭하고 있습니다." />
      <div className="mt-9 rounded-2xl bg-gray-800 p-6">
        <p role="status" className="body-16 text-white">
          {progress?.message || '첨삭을 준비하고 있습니다.'}
        </p>
        <progress
          aria-label="AI 첨삭 진행률"
          className="mt-4 h-3 w-full accent-primary-500"
          max={progress?.total || 1}
          value={progress?.total ? Math.min(progress.current, progress.total) : undefined}
        />
        {progress?.total ? (
          <p className="mt-2 text-gray-100">
            {progress.current}/{progress.total}개 문항
          </p>
        ) : null}
        {!hasJobId || connectionIssue ? (
          <div className="mt-4">
            <p role="alert" className="text-error-500">
              {connectionIssue ?? '첨삭 작업 정보를 확인하지 못했습니다.'}
            </p>
            <Button className="mt-3" onClick={onRefresh} isLoading={isFetching}>
              상태 새로고침
            </Button>
          </div>
        ) : null}
      </div>
      {questionResults.map((item) => (
        <article key={item.questionId} className="mt-6 rounded-2xl bg-gray-800 p-6 text-white">
          <h2 className="body-18">문항 {item.order} 첨삭 결과</h2>
          <p className="mt-3 whitespace-pre-wrap">
            {item.rewrittenAnswer ?? item.aiReport ?? '문항 결과를 준비하고 있습니다.'}
          </p>
        </article>
      ))}
    </section>
  );
}
