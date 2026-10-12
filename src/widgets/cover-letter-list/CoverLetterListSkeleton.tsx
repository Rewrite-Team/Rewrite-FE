import { COVER_LETTER_LIST_PAGE_SIZE } from '@/entities/cover-letter';
import { Skeleton } from '@/shared/ui/skeleton';

const SKELETON_CARD_KEYS = Array.from({ length: COVER_LETTER_LIST_PAGE_SIZE }, (_, index) => index);

/** 실제 카드의 높이와 열 배치를 유지하며 목록 조회 중임을 알립니다. */
export function CoverLetterListSkeleton() {
  return (
    <div aria-busy="true" className="mt-9" role="status">
      <span className="sr-only">자기소개서 목록을 불러오는 중입니다.</span>
      <ul
        aria-hidden="true"
        className="grid grid-cols-1 content-start gap-7 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SKELETON_CARD_KEYS.map((key) => (
          <li key={key}>
            <Skeleton className="h-72 rounded-4xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
