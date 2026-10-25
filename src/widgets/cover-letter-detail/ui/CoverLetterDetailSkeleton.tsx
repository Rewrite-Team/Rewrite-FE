import { Skeleton } from '@/shared/ui/skeleton';

export function CoverLetterDetailSkeleton() {
  return (
    <div aria-busy="true" role="status" className="writing-detail-content">
      <span className="sr-only">자기소개서를 불러오는 중입니다.</span>
      <Skeleton className="mb-10 h-12 w-64" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
