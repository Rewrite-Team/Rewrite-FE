'use client';

import { useState, type ReactNode } from 'react';

import type { ReviewVersionSummary } from '@/entities/review-version';
import {
  ReviewVersionPanel,
  ReviewVersionProvider,
  useReviewVersionQuery,
} from '@/features/review-version/version-management';
import { Sidebar } from '@/widgets/common/sidebar';

interface WritingDetailLayoutClientProps {
  children: ReactNode;
  initialSelectedVersionId: string;
  versions: ReviewVersionSummary[];
  writingId: string;
}

/** 상세 레이아웃의 사이드바와 버전 패널 선택 상태를 연결합니다. */
export function WritingDetailLayoutClient({
  children,
  initialSelectedVersionId,
  versions,
  writingId,
}: WritingDetailLayoutClientProps) {
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const { selectedVersionId, selectVersion } = useReviewVersionQuery({
    fallbackVersionId: initialSelectedVersionId,
    versions,
  });

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
          isVersionPanelOpen={isVersionPanelOpen}
          onVersionClick={() => setIsVersionPanelOpen((wasOpen) => !wasOpen)}
          writingId={writingId}
        />
        <section aria-label="자기소개서 콘텐츠" className="min-w-0 flex-1">
          {children}
        </section>
      </div>

      <ReviewVersionPanel onOpenChange={setIsVersionPanelOpen} open={isVersionPanelOpen} />
    </ReviewVersionProvider>
  );
}
