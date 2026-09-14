import type { FormEventHandler, ReactNode } from 'react';

import { VoiceInputButton } from '@/features/interview/voice-answer';
import { SendIcon } from '@/shared/assets/icons/interview';
import { Button } from '@/shared/ui/button';

interface InterviewAnswerFormProps {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

interface InterviewTextAnswerControlsProps {
  answer: string;
  isVoiceInputSupported: boolean;
  onAnswerChange: (answer: string) => void;
  onRecordingStart: () => void;
}

/**
 * ## InterviewAnswerForm
 *
 * @description
 * 텍스트 입력과 녹음 중 입력처럼 상태별 답변 컨트롤이 동일한 제출 동작과 외형을
 * 공유할 수 있도록 폼 프레임을 제공합니다.
 */
export function InterviewAnswerForm({ children, onSubmit }: InterviewAnswerFormProps) {
  return (
    <form
      autoComplete="off"
      className="mt-5 flex h-11 items-center rounded-full border border-gray-300 px-4 transition-[border-color,background-color,box-shadow] duration-200 has-[input:focus-visible]:border-primary-500 has-[input:focus-visible]:bg-gray-900/40 has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-primary-500/15 motion-reduce:transition-none"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}

/**
 * ## InterviewTextAnswerControls
 *
 * @description
 * 답변 작성 중 사용하는 텍스트 입력, 음성 입력 시작과 답변 전송 컨트롤을 제공합니다.
 */
export function InterviewTextAnswerControls({
  answer,
  isVoiceInputSupported,
  onAnswerChange,
  onRecordingStart,
}: InterviewTextAnswerControlsProps) {
  return (
    <>
      <label className="sr-only" htmlFor="interview-answer">
        면접 답변
      </label>
      <input
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent body-14 text-white outline-none placeholder:text-gray-300 transition-colors duration-200 focus-visible:placeholder:text-gray-400 motion-reduce:transition-none"
        id="interview-answer"
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="답변을 입력하세요"
        value={answer}
      />
      <VoiceInputButton isSupported={isVoiceInputSupported} onStart={onRecordingStart} />
      <Button
        aria-label="답변 전송"
        className="ml-3 size-8 rounded-full p-0 disabled:bg-primary-500 disabled:opacity-50"
        disabled={!answer.trim()}
        iconOnly
        type="submit"
      >
        <SendIcon aria-hidden className="size-7" />
      </Button>
    </>
  );
}
