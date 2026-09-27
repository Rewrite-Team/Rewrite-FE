'use client';

import { useId } from 'react';

import { PanelCloseIcon } from '@/shared/assets/icons/version';
import { Button } from '@/shared/ui/button';
import { Surface } from '@/shared/ui/surface';
import { Title } from '@/shared/ui/title';

import { ReviewVersionTimeline } from './ReviewVersionTimeline';
import { useReviewVersion } from '../model/ReviewVersionContext';

interface ReviewVersionPanelProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/** 저장된 버전과 생성 진행 상태를 시간순으로 표시하는 우측 패널입니다. */
export function ReviewVersionPanel({ onOpenChange, open }: ReviewVersionPanelProps) {
  const titleId = `review-version-panel-title-${useId()}`;
  const { selectedVersionId, selectVersion, versions } = useReviewVersion();

  const handleVersionSelect = (versionId: string) => {
    selectVersion(versionId);

    if (window.matchMedia?.('(max-width: 63.999rem)').matches) {
      onOpenChange(false);
    }
  };

  return (
    <Surface
      closeOnOutsideClick={false}
      focusTrap={false}
      onOpenChange={onOpenChange}
      open={open}
      scrollLock={false}
      variant="panel"
    >
      <Surface.Portal>
        <Surface.Content
          aria-labelledby={titleId}
          className="top-16 h-[calc(100dvh-4rem)] w-[min(20rem,100vw)] rounded-tl-2xl rounded-bl-none"
        >
          <Surface.Header className="flex shrink-0 items-center gap-3 px-5 py-5">
            <Surface.Close aria-label="버전 관리 패널 닫기" asChild>
              <Button aria-label="버전 관리 패널 닫기" className="size-8" iconOnly variant="ghost">
                <PanelCloseIcon aria-hidden="true" className="size-5" />
              </Button>
            </Surface.Close>
            <Title as="h2" className="body-18" id={titleId}>
              버전 관리
            </Title>
          </Surface.Header>

          <Surface.Body className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
            {versions.length === 0 ? (
              <p className="m-0 body-14 text-gray-200" role="status">
                저장된 버전이 없습니다.
              </p>
            ) : (
              <ReviewVersionTimeline
                onSelect={handleVersionSelect}
                selectedVersionId={selectedVersionId}
                versions={versions}
              />
            )}
          </Surface.Body>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}
