import type { RefObject } from 'react';

import { CancelIcon, CheckIcon } from '@/shared/assets/icons/common';
import { VoiceRecordIcon } from '@/shared/assets/icons/interview';
import { Button } from '@/shared/ui/button';

import styles from './VoiceRecordingControls.module.css';
import { INITIAL_INTERVIEW_WAVEFORM_LEVELS } from '../model/constants';

import type { InterviewRecordingStatus } from '../model/types';

interface VoiceRecordingControlsProps {
  onCancel: () => void;
  onComplete: () => void;
  status: Exclude<InterviewRecordingStatus, 'idle'>;
  transcript: string;
  waveformRef: RefObject<HTMLDivElement | null>;
}

/**
 * ## VoiceRecordingControls
 *
 * @description
 * 실제 마이크 음량이 오른쪽에서 추가되고 왼쪽으로 흐르는 파형과 음성 입력 취소·완료
 * 컨트롤을 제공합니다. 권한 확인과 음성 처리 상태는 스크린 리더에 별도로 안내합니다.
 */
export function VoiceRecordingControls({
  onCancel,
  onComplete,
  status,
  transcript,
  waveformRef,
}: VoiceRecordingControlsProps) {
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
