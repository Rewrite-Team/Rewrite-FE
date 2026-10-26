'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import type { ReviewVersionSummary } from '@/entities/review-version';
import { useDeleteCoverLetter } from '@/features/cover-letter/delete';
import {
  ReviewVersionPanel,
  ReviewVersionProvider,
  useReviewVersionQuery,
} from '@/features/review-version/version-management';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { Sidebar } from '@/widgets/common/sidebar';

interface WritingDetailLayoutClientProps {
  children: ReactNode;
  isReviewing?: boolean;
  initialSelectedVersionId: string;
  versions: ReviewVersionSummary[];
  writingId: string;
  beforeVersionSelect: (versionId: string) => Promise<void>;
}

/** 상세 레이아웃의 사이드바와 버전 패널 선택 상태를 연결합니다. */
export function WritingDetailLayoutClient({ ...props }: WritingDetailLayoutClientProps) {
  const pathname = usePathname();

  // 하위 페이지로 이동할 때 레이아웃이 유지되므로 경로별로 패널의 로컬 상태를 초기화합니다.
  return <WritingDetailLayoutContent key={pathname} pathname={pathname} {...props} />;
}

interface WritingDetailLayoutContentProps extends WritingDetailLayoutClientProps {
  pathname: string;
}

function WritingDetailLayoutContent({
  children,
  isReviewing = false,
  initialSelectedVersionId,
  pathname,
  versions,
  writingId,
  beforeVersionSelect,
}: WritingDetailLayoutContentProps) {
  const router = useRouter();
  const deleteMutation = useDeleteCoverLetter();
  const latestSelectionRequestIdRef = useRef(0);
  useEffect(
    () => () => {
      latestSelectionRequestIdRef.current += 1;
    },
    []
  );
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const isDetailPage = pathname === ROUTES.WRITING_DETAIL(writingId);
  const { selectedVersionId, selectVersion } = useReviewVersionQuery({
    fallbackVersionId: initialSelectedVersionId,
    versions,
  });
  const handleVersionPanelToggle = () => {
    setIsVersionPanelOpen((wasOpen) => !wasOpen);
  };

  const handleDelete = async () => {
    // SSE 연결은 상세 화면이 언마운트될 때 AbortController cleanup으로 종료됩니다.
    // 목록 이동은 DELETE 성공 응답을 받은 뒤에만 실행합니다.
    await deleteMutation.mutateAsync(writingId);
    router.replace(ROUTES.WRITING);
  };

  const handleVersionSelect = (versionId: string) => {
    const selectionRequestId = ++latestSelectionRequestIdRef.current;
    // 조회 성공 전까지 현재 버전과 URL을 유지하고, 마지막으로 선택한 요청만 반영합니다.
    void Promise.resolve()
      .then(() => beforeVersionSelect(versionId))
      .then(() => {
        if (selectionRequestId === latestSelectionRequestIdRef.current) selectVersion(versionId);
      })
      .catch(() => {
        if (selectionRequestId === latestSelectionRequestIdRef.current)
          appToast.error('선택한 버전을 불러오지 못했습니다. 이전 결과를 유지합니다.');
      });
  };

  return (
    <ReviewVersionProvider
      onSelectedVersionChange={handleVersionSelect}
      selectedVersionId={selectedVersionId}
      versions={versions}
    >
      <div className="mx-auto flex min-h-full w-full max-w-275 flex-1">
        <Sidebar
          className="fixed right-5 bottom-5 lg:sticky lg:top-39.5 lg:right-auto lg:bottom-auto lg:self-start"
          isDeletePending={deleteMutation.isPending}
          isReviewing={isReviewing}
          isVersionPanelOpen={isDetailPage && isVersionPanelOpen}
          onDelete={handleDelete}
          onVersionClick={handleVersionPanelToggle}
          writingId={writingId}
        />
        <section aria-label="자기소개서 콘텐츠" className="min-w-0 flex-1">
          {children}
        </section>
      </div>

      {isDetailPage ? (
        <ReviewVersionPanel onOpenChange={setIsVersionPanelOpen} open={isVersionPanelOpen} />
      ) : null}
    </ReviewVersionProvider>
  );
}
