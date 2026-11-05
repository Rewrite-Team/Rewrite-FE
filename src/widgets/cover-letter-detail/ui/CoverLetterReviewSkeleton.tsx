import { Skeleton } from '@/shared/ui/skeleton';
import { Title } from '@/shared/ui/title';

interface CoverLetterReviewContentSkeletonProps {
  title: string;
}

/** 첨삭 결과 콘텐츠가 도착하기 전의 텍스트 영역 스켈레톤입니다. */
export function CoverLetterReviewContentSkeleton({ title }: CoverLetterReviewContentSkeletonProps) {
  return (
    <section aria-label={`${title} 생성 중`} aria-busy="true" className="flex flex-col gap-3">
      <Title as="h3" className="body-18">
        {title}
      </Title>
      <div className="flex min-h-81.75 flex-col gap-4 rounded-lg bg-gray-600 px-5 py-6">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </section>
  );
}

/** 원문·AI 첨삭 비교 콘텐츠가 도착하기 전의 2열 스켈레톤입니다. */
export function CoverLetterReviewDiffSkeleton() {
  return (
    <section
      aria-label="자기소개서와 AI 첨삭 비교 생성 중"
      aria-busy="true"
      className="flex flex-col gap-3"
    >
      <Title as="h3" className="body-18">
        자기소개서 VS AI 첨삭
      </Title>
      <div className="grid min-h-81.75 overflow-hidden rounded-lg bg-gray-600 md:grid-cols-2">
        {['원문', 'AI 첨삭본'].map((title, index) => (
          <article
            className={`min-w-0 px-5 py-6 ${index === 1 ? 'border-t border-gray-500 md:border-t-0 md:border-l' : ''}`}
            key={title}
          >
            <Title as="h4" className="body-14 text-gray-100">
              {title}
            </Title>
            <div aria-hidden="true" className="mt-4 flex flex-col gap-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
