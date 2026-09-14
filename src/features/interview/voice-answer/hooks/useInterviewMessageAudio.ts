import { useEffect, useRef } from 'react';

import { getInterviewRecording, type InterviewMessage } from '@/entities/interview';
import { appToast } from '@/shared/lib/toast';

/**
 * ## useInterviewMessageAudio
 *
 * @description
 * 녹음 답변은 IndexedDB의 원본 음성을 재생하고, 텍스트 메시지는 브라우저 TTS로 읽습니다.
 * 재생이 끝나거나 컴포넌트가 해제되면 임시 Blob URL을 정리합니다.
 */
export function useInterviewMessageAudio() {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioUrlRef = useRef<string | null>(null);

  const releaseActiveAudio = () => {
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;

    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
    }
  };

  const playMessageAudio = async (message: InterviewMessage) => {
    releaseActiveAudio();
    window.speechSynthesis?.cancel();

    if (!message.recordingId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(message.content));
      }

      return;
    }

    try {
      const recording = await getInterviewRecording(message.recordingId);

      if (!recording) {
        appToast.error('저장된 음성을 찾지 못했습니다.');
        return;
      }

      const audioUrl = URL.createObjectURL(recording.audioBlob);
      const audio = new Audio(audioUrl);

      activeAudioRef.current = audio;
      activeAudioUrlRef.current = audioUrl;
      audio.addEventListener('ended', releaseActiveAudio, { once: true });
      await audio.play();
    } catch {
      releaseActiveAudio();
      appToast.error('음성을 재생하지 못했습니다.');
    }
  };

  useEffect(
    () => () => {
      releaseActiveAudio();
      window.speechSynthesis?.cancel();
    },
    []
  );

  return { playMessageAudio };
}
