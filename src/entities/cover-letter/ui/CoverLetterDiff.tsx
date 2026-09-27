import { useId } from 'react';

import { Title } from '@/shared/ui/title';

import { createTextDiff } from '../model/createTextDiff';

import type { TextDiffPart } from '../model/createTextDiff';

interface CoverLetterDiffProps {
  original: string;
  reviewed: string;
}

interface DiffTextProps {
  parts: TextDiffPart[];
  variant: 'original' | 'reviewed';
}

function DiffText({ parts, variant }: DiffTextProps) {
  return (
    <p className="mt-4 mb-0 wrap-break-word whitespace-pre-wrap body-16 text-white">
      {parts.map((part, index) => {
        const key = `${variant}-${part.type}-${index}`;

        if (part.type === 'added') {
          return variant === 'reviewed' ? (
            <ins
              className="rounded bg-primary-500/20 px-0.5 text-primary-200 no-underline"
              key={key}
            >
              {part.value}
            </ins>
          ) : null;
        }

        if (part.type === 'removed') {
          return variant === 'original' ? (
            <del className="rounded bg-error-500/20 px-0.5 text-error-500 decoration-2" key={key}>
              {part.value}
            </del>
          ) : null;
        }

        return <span key={key}>{part.value}</span>;
      })}
    </p>
  );
}

/** 자기소개서 원문과 AI 첨삭본의 추가·삭제 내용을 단어와 공백 단위로 표시합니다. */
export function CoverLetterDiff({ original, reviewed }: CoverLetterDiffProps) {
  const generatedId = useId();
  const titleId = `cover-letter-diff-${generatedId}`;
  const hasChanges = original !== reviewed;
  const diffParts = hasChanges ? createTextDiff(original, reviewed) : [];

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <Title as="h3" className="body-18" id={titleId}>
        자기소개서 VS AI 첨삭
      </Title>

      {hasChanges ? (
        <div className="grid min-h-81.75 overflow-hidden rounded-lg bg-gray-600 md:grid-cols-2">
          <article className="min-w-0 px-5 py-6">
            <Title as="h4" className="body-14 text-gray-100">
              원문
            </Title>
            <DiffText parts={diffParts} variant="original" />
          </article>

          <article className="min-w-0 border-t border-gray-500 px-5 py-6 md:border-t-0 md:border-l">
            <Title as="h4" className="body-14 text-gray-100">
              AI 첨삭본
            </Title>
            <DiffText parts={diffParts} variant="reviewed" />
          </article>
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-lg bg-gray-600 px-5 py-6">
          <p className="m-0 body-16 text-gray-100">변경된 내용이 없습니다.</p>
        </div>
      )}
    </section>
  );
}
