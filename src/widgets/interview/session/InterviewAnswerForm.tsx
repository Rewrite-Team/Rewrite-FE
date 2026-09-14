import type { FormEventHandler, ReactNode, RefObject } from 'react';

import { INITIAL_INTERVIEW_WAVEFORM_LEVELS } from '@/features/interview/voice-answer';
import type { InterviewRecordingStatus } from '@/features/interview/voice-answer';
import { CancelIcon, CheckIcon } from '@/shared/assets/icons/common';
import { SendIcon, VoiceRecordIcon } from '@/shared/assets/icons/interview';
import { Button } from '@/shared/ui/button';
import { Tooltip } from '@/shared/ui/tooltip';

import styles from './InterviewSession.module.css';

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

interface InterviewRecordingControlsProps {
  onCancel: () => void;
  onComplete: () => void;
  status: Exclude<InterviewRecordingStatus, 'idle'>;
  transcript: string;
  waveformRef: RefObject<HTMLDivElement | null>;
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
      <Tooltip.Root offset={8} placement="top">
        <Tooltip.Trigger
          render={
            <span
              aria-label={!isVoiceInputSupported ? '음성 입력 미지원 안내' : undefined}
              className="inline-flex"
              tabIndex={!isVoiceInputSupported ? 0 : undefined}
            >
              <Button
                aria-label="음성 입력 시작"
                className="size-9 p-0 text-gray-200 data-[disabled=false]:hover:text-white"
                disabled={!isVoiceInputSupported}
                iconOnly
                onClick={onRecordingStart}
                variant="ghost"
              >
                <VoiceRecordIcon aria-hidden className="size-6" />
              </Button>
            </span>
          }
        />
        <Tooltip.Content>
          {isVoiceInputSupported
            ? '음성 입력은 Chrome에서 안정적으로 작동합니다.'
            : '이 브라우저에서는 음성 입력을 지원하지 않습니다. Chrome을 사용해 주세요.'}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Root>
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

/**
 * ## InterviewRecordingControls
 *
 * @description
 * 실제 마이크 음량이 오른쪽에서 추가되고 왼쪽으로 흐르는 파형과 음성 입력 취소·완료
 * 컨트롤을 제공합니다.
 * 권한 확인과 음성 처리 상태는 스크린 리더에 별도로 안내합니다.
 */
export function InterviewRecordingControls({
  onCancel,
  onComplete,
  status,
  transcript,
  waveformRef,
}: InterviewRecordingControlsProps) {
  const isRecording = status === 'recording';

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <p aria-live="polite" className="sr-only">
        {status === 'requesting'
          ? '마이크 권한을 확인하고 있습니다.'
          : status === 'processing'
            ? '음성 답변을 처리하고 있습니다.'
            : transcript || '음성 답변을 녹음하고 있습니다.'}
      </p>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span aria-hidden className={styles.recordingIcon}>
          <VoiceRecordIcon className="size-5" />
        </span>
        <div aria-hidden className={styles.recordingWaveform} ref={waveformRef}>
          {INITIAL_INTERVIEW_WAVEFORM_LEVELS.map((height, index) => (
            <span key={index} style={{ height }} />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label="음성 입력 취소"
          className="size-8 rounded-lg bg-gray-900 p-0 text-gray-100 hover:bg-gray-800 hover:text-white"
          disabled={status === 'processing'}
          iconOnly
          onClick={onCancel}
          variant="ghost"
        >
          <CancelIcon aria-hidden className="size-6" />
        </Button>
        <Button
          aria-label="음성 입력 완료"
          className="size-8 rounded-lg p-0"
          disabled={!isRecording}
          iconOnly
          onClick={onComplete}
        >
          <CheckIcon aria-hidden className="size-3" />
        </Button>
      </div>
    </div>
  );
}
