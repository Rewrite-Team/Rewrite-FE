import type { FormEventHandler, ReactNode } from 'react';

import { CancelIcon, CheckIcon } from '@/shared/assets/icons/common';
import { SendIcon, VoiceRecordIcon } from '@/shared/assets/icons/interview';
import { Button } from '@/shared/ui/button';

import { RECORDING_WAVEFORM_HEIGHTS } from './constants';
import styles from './InterviewSession.module.css';

interface InterviewAnswerFormProps {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

interface InterviewTextAnswerControlsProps {
  answer: string;
  onAnswerChange: (answer: string) => void;
  onRecordingStart: () => void;
}

interface InterviewRecordingControlsProps {
  onCancel: () => void;
  onComplete: () => void;
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
      className="mt-5 flex h-11 items-center rounded-full border border-gray-300 px-4"
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
  onAnswerChange,
  onRecordingStart,
}: InterviewTextAnswerControlsProps) {
  return (
    <>
      <label className="sr-only" htmlFor="interview-answer">
        면접 답변
      </label>
      <input
        className="min-w-0 flex-1 bg-transparent body-14 text-white outline-none placeholder:text-gray-300"
        id="interview-answer"
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="답변을 입력하세요"
        value={answer}
      />
      <Button
        aria-label="음성 입력 시작"
        className="size-9 p-0 text-gray-200 data-[disabled=false]:hover:text-white"
        iconOnly
        onClick={onRecordingStart}
        variant="ghost"
      >
        <VoiceRecordIcon aria-hidden className="size-6" />
      </Button>
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
 * 녹음 중임을 알리는 파형과 음성 입력 취소·완료 컨트롤을 제공합니다. 현재 파형은
 * 실제 마이크 분석 데이터가 연결되기 전 사용하는 시각적 피드백입니다.
 */
export function InterviewRecordingControls({
  onCancel,
  onComplete,
}: InterviewRecordingControlsProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span aria-hidden className={styles.recordingIcon}>
          <VoiceRecordIcon className="size-5" />
        </span>
        <div aria-hidden className={styles.recordingWaveform}>
          {RECORDING_WAVEFORM_HEIGHTS.map((height, index) => (
            <span
              key={`${height}-${index}`}
              style={{ animationDelay: `${index * -45}ms`, height }}
            />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label="음성 입력 취소"
          className="size-8 rounded-lg bg-gray-900 p-0 text-gray-100 hover:bg-gray-800 hover:text-white"
          iconOnly
          onClick={onCancel}
          variant="ghost"
        >
          <CancelIcon aria-hidden className="size-6" />
        </Button>
        <Button
          aria-label="음성 입력 완료"
          className="size-8 rounded-lg p-0"
          iconOnly
          onClick={onComplete}
        >
          <CheckIcon aria-hidden className="size-3" />
        </Button>
      </div>
    </div>
  );
}
