import type { RefObject } from 'react';

import { SideBarIcon } from '@/shared/assets/icons/interview';
import { cn } from '@/shared/styles/utils/cn';
import { Button } from '@/shared/ui/button';
import { Tooltip } from '@/shared/ui/tooltip';

import type { InterviewQuestion } from './types';

interface InterviewQuestionPanelProps {
  activeQuestionId: number;
  isOpen: boolean;
  listRef: RefObject<HTMLOListElement | null>;
  onAdd: () => void;
  onSelect: (questionId: number) => void;
  onToggle: () => void;
  questions: InterviewQuestion[];
}

/**
 * ## InterviewQuestionPanel
 *
 * @description
 * 면접 질문 목록의 열기·닫기, 질문 추가와 질문 선택 UI를 하나의 사이드 패널로 제공합니다.
 *
 * ### 접근성
 *
 * 닫힌 패널은 `inert`로 키보드 탐색에서 제외하며, 토글 버튼의 `aria-controls`와
 * `aria-expanded`로 패널 상태를 전달합니다.
 */
export function InterviewQuestionPanel({
  activeQuestionId,
  isOpen,
  listRef,
  onAdd,
  onSelect,
  onToggle,
  questions,
}: InterviewQuestionPanelProps) {
  return (
    <>
      {!isOpen ? (
        <Button
          aria-controls="interview-question-list"
          aria-expanded={false}
          aria-label="질문 목록 열기"
          className="absolute top-3 right-3 z-20 size-8 rounded-lg bg-gray-700/90 p-0 text-gray-200 hover:bg-gray-600 hover:text-primary-500"
          iconOnly
          onClick={onToggle}
          variant="ghost"
        >
          <SideBarIcon aria-hidden className="size-4" />
        </Button>
      ) : null}

      <aside
        aria-hidden={!isOpen}
        aria-labelledby="interview-question-list-title"
        className={cn(
          'absolute inset-y-0 right-0 z-10 w-[min(90%,20rem)] overflow-hidden rounded-2xl bg-gray-500 transition-transform duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        id="interview-question-list"
        inert={!isOpen}
      >
        <div className="flex h-16 items-center gap-3 px-5">
          <Button
            aria-controls="interview-question-list"
            aria-expanded={true}
            aria-label="질문 목록 닫기"
            className="size-5 p-0 text-white hover:text-primary-500"
            iconOnly
            onClick={onToggle}
            variant="ghost"
          >
            <SideBarIcon aria-hidden className="size-5" />
          </Button>
          <h2 className="body-14 font-semibold text-white" id="interview-question-list-title">
            질문 목록
          </h2>
          <Tooltip.Root offset={8} placement="top">
            <Tooltip.Trigger
              render={
                <Button
                  aria-label="질문 1개 추가하기"
                  className="ml-auto size-5 rounded border border-white p-0 text-white hover:border-primary-300"
                  iconOnly
                  onClick={onAdd}
                  variant="ghost"
                >
                  <span aria-hidden className="body-16 leading-none">
                    +
                  </span>
                </Button>
              }
            />
            <Tooltip.Content>
              질문 1개 추가하기
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Root>
        </div>

        <ol
          aria-label="면접 질문 목록"
          className="textarea-scrollbar h-[calc(100%-4rem)] space-y-1 overflow-y-auto px-5 pt-4 pb-5"
          ref={listRef}
        >
          {questions.map((question) => (
            <li key={question.id}>
              <button
                aria-current={question.id === activeQuestionId ? 'true' : undefined}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left body-14 text-white transition-colors hover:bg-gray-600 focus-ring',
                  question.id === activeQuestionId ? 'bg-gray-700' : 'bg-transparent'
                )}
                onClick={() => onSelect(question.id)}
                type="button"
              >
                {question.prompt}
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </>
  );
}
