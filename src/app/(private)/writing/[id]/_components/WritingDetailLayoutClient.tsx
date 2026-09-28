'use client';

import { useState, type ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import type { ReviewVersionSummary } from '@/entities/review-version';
import {
  ReviewVersionPanel,
  ReviewVersionProvider,
  useReviewVersionQuery,
} from '@/features/review-version/version-management';
import { ROUTES } from '@/shared/constants/routes';
import { Sidebar } from '@/widgets/common/sidebar';

interface WritingDetailLayoutClientProps {
  children: ReactNode;
  initialSelectedVersionId: string;
  versions: ReviewVersionSummary[];
  writingId: string;
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
  initialSelectedVersionId,
  pathname,
  versions,
  writingId,
}: WritingDetailLayoutContentProps) {
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const isDetailPage = pathname === ROUTES.WRITING_DETAIL(writingId);
  const { selectedVersionId, selectVersion } = useReviewVersionQuery({
    fallbackVersionId: initialSelectedVersionId,
    versions,
  });
  const handleVersionPanelToggle = () => {
    setIsVersionPanelOpen((wasOpen) => !wasOpen);
  };

  return (
    <ReviewVersionProvider
      editableVersionId={initialSelectedVersionId}
      initialSelectedVersionId={initialSelectedVersionId}
      onSelectedVersionChange={selectVersion}
      selectedVersionId={selectedVersionId}
      versions={versions}
    >
      <div className="mx-auto flex min-h-full w-full max-w-275 flex-1">
        <Sidebar
          className="fixed right-5 bottom-5 lg:sticky lg:top-39.5 lg:right-auto lg:bottom-auto lg:self-start"
          isVersionPanelOpen={isDetailPage && isVersionPanelOpen}
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
