import type { RefObject } from 'react';

import { CopyIcon, ListenIcon } from '@/shared/assets/icons/interview';
import { appToast } from '@/shared/lib/toast';
import { cn } from '@/shared/styles/utils/cn';
import { Button } from '@/shared/ui/button';

import type { InterviewMessage } from './types';

interface InterviewConversationProps {
  isQuestionPanelOpen: boolean;
  listRef: RefObject<HTMLOListElement | null>;
  messages: InterviewMessage[];
}

/**
 * ## InterviewConversation
 *
 * @description
 * 현재 질문의 대화를 역할별 말풍선으로 표시하고 각 메시지의 듣기·복사 동작을 제공합니다.
 * 질문 패널이 열리면 사용자 말풍선이 패널과 겹치지 않도록 위치를 조정합니다.
 *
 * ### 접근성
 *
 * 대화 목록은 새 메시지를 알리는 live region이며, 메시지 액션은 발화 주체를 구분한
 * 접근성 이름을 제공합니다.
 */
export function InterviewConversation({
  isQuestionPanelOpen,
  listRef,
  messages,
}: InterviewConversationProps) {
  const handleMessageListen = (message: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
  };

  const handleMessageCopy = async (message: string) => {
    if (!navigator.clipboard) {
      appToast.error('복사하지 못했습니다. 다시 시도해 주세요.');
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      appToast.success('복사되었습니다.');
    } catch {
      appToast.error('복사하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <ol
      aria-label="면접 대화"
      aria-live="polite"
      className="textarea-scrollbar flex h-full list-none flex-col gap-8 overflow-y-auto px-4 py-5 sm:px-6"
      ref={listRef}
    >
      {messages.map((message) => (
        <li
          className={cn(
            'group flex w-full',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
          key={message.id}
        >
          <div
            className={cn(
              'relative w-[72%] transition-[margin] duration-300 ease-out motion-reduce:transition-none sm:w-[38%]',
              isQuestionPanelOpen && message.role === 'user' && 'sm:mr-80'
            )}
          >
            <p className="rounded-xl bg-gray-600 px-4 py-3 body-14 text-gray-50 sm:px-5">
              {message.content}
            </p>

            <div className="absolute top-full right-0 flex justify-end gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                aria-label={message.role === 'user' ? '내 답변 듣기' : 'AI 질문 듣기'}
                className="size-5 p-0"
                iconOnly
                onClick={() => handleMessageListen(message.content)}
                variant="ghost"
              >
                <ListenIcon aria-hidden className="size-3.5" />
              </Button>
              <Button
                aria-label={message.role === 'user' ? '내 답변 복사하기' : 'AI 질문 복사하기'}
                className="size-5 p-0"
                iconOnly
                onClick={() => void handleMessageCopy(message.content)}
                variant="ghost"
              >
                <CopyIcon aria-hidden className="size-3.5" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
