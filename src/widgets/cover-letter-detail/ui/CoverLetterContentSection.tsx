import { useId, type ReactNode } from 'react';

import { Title } from '@/shared/ui/title';

interface CoverLetterContentSectionProps {
  children: ReactNode;
  title: string;
  characterCount?: {
    current: number;
    limit: number;
  };
}

/** 자기소개서 문항 안의 읽기 전용 콘텐츠를 제목과 함께 표시합니다. */
export function CoverLetterContentSection({
  characterCount,
  children,
  title,
}: CoverLetterContentSectionProps) {
  const generatedId = useId();
  const titleId = `cover-letter-section-${generatedId}`;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <Title as="h3" className="body-18" id={titleId}>
        {title}
      </Title>
      <div className="flex min-h-81.75 flex-col rounded-lg bg-gray-600 px-5 py-6 text-white">
        <div className="wrap-break-word whitespace-pre-wrap body-16">{children}</div>
        {characterCount ? (
          <p
            aria-label={`${characterCount.limit}자 중 ${characterCount.current}자 작성`}
            className="mt-auto mb-0 pt-8 text-right body-16"
          >
            <span className="text-primary-500">{characterCount.current}</span>
            <span>/{characterCount.limit}자</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
