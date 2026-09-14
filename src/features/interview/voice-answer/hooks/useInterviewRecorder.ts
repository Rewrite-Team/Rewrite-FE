import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useSpeechRecognition } from './useSpeechRecognition';
import {
  INITIAL_INTERVIEW_WAVEFORM_LEVELS,
  INTERVIEW_WAVEFORM_MAX_HEIGHT,
  INTERVIEW_WAVEFORM_MIN_HEIGHT,
  INTERVIEW_WAVEFORM_UPDATE_INTERVAL_MS,
} from '../model/constants';

import type { CompletedInterviewRecording, InterviewRecordingStatus } from '../model/types';

const subscribeToRecorderSupport = () => () => undefined;
const getServerRecorderSupportSnapshot = () => false;

function getRecorderSupportSnapshot() {
  return Boolean(
    typeof window !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    'AudioContext' in window &&
    'MediaRecorder' in window
  );
}

function createWaveformLevel(data: Uint8Array<ArrayBuffer>) {
  let total = 0;

  for (const value of data) {
    total += value;
  }

  const normalizedLevel = Math.min(1, (total / data.length / 255) * 2.4);

  return Math.max(
    INTERVIEW_WAVEFORM_MIN_HEIGHT,
    Math.round(normalizedLevel * INTERVIEW_WAVEFORM_MAX_HEIGHT)
  );
}

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const requestIdRef = useRef(0);
  const lastWaveformUpdateRef = useRef(0);
  const waveformLevelsRef = useRef([...INITIAL_INTERVIEW_WAVEFORM_LEVELS]);
  const waveformRef = useRef<HTMLDivElement>(null);
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

  const renderWaveformLevels = (levels: number[]) => {
    const waveform = waveformRef.current;

    if (!waveform) {
      return;
    }

    levels.forEach((height, index) => {
      const bar = waveform.children.item(index);

      if (bar instanceof HTMLElement) {
        bar.style.height = `${height}px`;
      }
    });
  };

  const resetWaveform = () => {
    waveformLevelsRef.current.fill(INTERVIEW_WAVEFORM_MIN_HEIGHT);
    renderWaveformLevels(waveformLevelsRef.current);
  };

  const appendWaveformLevel = (level: number) => {
    const levels = waveformLevelsRef.current;

    levels.copyWithin(0, 1);
    levels[levels.length - 1] = level;
    renderWaveformLevels(levels);
  };

  const stopVisualization = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const releaseMediaResources = () => {
    stopVisualization();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    const audioContext = audioContextRef.current;

    audioContextRef.current = null;
    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close();
    }
  };

  const startVisualization = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    audioContextRef.current = audioContext;

    const updateWaveform = (timestamp: number) => {
      if (timestamp - lastWaveformUpdateRef.current >= INTERVIEW_WAVEFORM_UPDATE_INTERVAL_MS) {
        analyser.getByteFrequencyData(frequencyData);
        appendWaveformLevel(createWaveformLevel(frequencyData));
        lastWaveformUpdateRef.current = timestamp;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateWaveform);
    };

    animationFrameRef.current = window.requestAnimationFrame(updateWaveform);
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
      resetWaveform();
      recorder.start();
      startRecognition();
      startVisualization(stream);
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
    resetWaveform();
    setStatus('idle');
  };

  const completeRecording = async (): Promise<CompletedInterviewRecording> => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== 'recording') {
      throw new Error('RECORDING_NOT_ACTIVE');
    }

    setStatus('processing');
    stopVisualization();

    const audioPromise = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener('error', () => reject(new Error('RECORDING_FAILED')), {
        once: true,
      });
      recorder.addEventListener(
        'stop',
        () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType })),
        { once: true }
      );
      recorder.stop();
    });

    try {
      const [audioBlob, recognizedTranscript] = await Promise.all([
        audioPromise,
        stopRecognition(),
      ]);
      const durationMs = Math.max(0, performance.now() - recordingStartedAtRef.current);

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
      resetWaveform();
      setStatus('idle');
    }
  };

  useEffect(
    () => () => {
      requestIdRef.current += 1;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current?.state !== 'closed') {
        void audioContextRef.current?.close();
      }
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
