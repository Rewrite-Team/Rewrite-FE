import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useAudioWaveform } from './useAudioWaveform';
import { useSpeechRecognition } from './useSpeechRecognition';

import type { CompletedInterviewRecording, InterviewRecordingStatus } from '../model/types';

const subscribeToRecorderSupport = () => () => undefined;
const getServerRecorderSupportSnapshot = () => false;

const getRecorderSupportSnapshot = () => {
  return Boolean(
    typeof window !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    'AudioContext' in window &&
    'MediaRecorder' in window
  );
};

/**
 * ## useInterviewRecorder
 *
 * @description
 * 마이크 스트림을 녹음 Blob과 실제 음량 기반 파형으로 변환하고 브라우저 음성 인식 결과와
 * 함께 반환합니다. 취소·완료 시 미디어 트랙과 AudioContext를 정리합니다.
 */
export function useInterviewRecorder() {
  const [status, setStatus] = useState<InterviewRecordingStatus>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const requestIdRef = useRef(0);
  const { startWaveform, stopWaveform, waveformRef } = useAudioWaveform();
  const recorderSupported = useSyncExternalStore(
    subscribeToRecorderSupport,
    getRecorderSupportSnapshot,
    getServerRecorderSupportSnapshot
  );
  const {
    abortRecognition,
    isSupported: recognitionSupported,
    startRecognition,
    stopRecognition,
    transcript,
  } = useSpeechRecognition();
  const isSupported = recorderSupported && recognitionSupported;

  const releaseMediaResources = () => {
    stopWaveform();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const startRecording = async () => {
    if (!isSupported) {
      throw new Error('VOICE_INPUT_UNSUPPORTED');
    }

    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      recordingStartedAtRef.current = performance.now();
      recorder.start();
      startRecognition();
      startWaveform(stream);
      setStatus('recording');
    } catch (error) {
      abortRecognition();

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      mediaRecorderRef.current = null;
      releaseMediaResources();
      setStatus('idle');
      throw error;
    }
  };

  const cancelRecording = () => {
    requestIdRef.current += 1;
    abortRecognition();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    releaseMediaResources();
    setStatus('idle');
  };

  const completeRecording = async (): Promise<CompletedInterviewRecording> => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== 'recording') {
      throw new Error('RECORDING_NOT_ACTIVE');
    }

    setStatus('processing');
    stopWaveform();

    const audioPromise = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener('error', () => reject(new Error('RECORDING_FAILED')), {
        once: true,
      });
      recorder.addEventListener(
        'stop',
        () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType })),
        { once: true }
      );
    });
    const recordingEndedAt = performance.now();

    recorder.stop();

    try {
      const [audioBlob, recognizedTranscript] = await Promise.all([
        audioPromise,
        stopRecognition(),
      ]);
      const durationMs = Math.max(0, recordingEndedAt - recordingStartedAtRef.current);

      if (audioBlob.size === 0) {
        throw new Error('EMPTY_RECORDING');
      }

      return {
        audioBlob,
        durationMs,
        transcript: recognizedTranscript,
      };
    } finally {
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      releaseMediaResources();
      setStatus('idle');
    }
  };

  useEffect(
    () => () => {
      requestIdRef.current += 1;

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  return {
    cancelRecording,
    completeRecording,
    isSupported,
    startRecording,
    status,
    transcript,
    waveformRef,
  };
}
