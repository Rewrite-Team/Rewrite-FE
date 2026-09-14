import { useEffect, useRef } from 'react';

import {
  INITIAL_INTERVIEW_WAVEFORM_LEVELS,
  INTERVIEW_WAVEFORM_MAX_HEIGHT,
  INTERVIEW_WAVEFORM_MIN_HEIGHT,
  INTERVIEW_WAVEFORM_UPDATE_INTERVAL_MS,
} from '../model/constants';

const WAVEFORM_SENSITIVITY = 2.4;

const createWaveformLevel = (data: Uint8Array<ArrayBuffer>) => {
  let total = 0;

  for (const value of data) {
    total += value;
  }

  const normalizedLevel = Math.min(1, (total / data.length / 255) * WAVEFORM_SENSITIVITY);

  return Math.max(
    INTERVIEW_WAVEFORM_MIN_HEIGHT,
    Math.round(normalizedLevel * INTERVIEW_WAVEFORM_MAX_HEIGHT)
  );
};

/**
 * ## useAudioWaveform
 *
 * @description
 * 마이크 스트림의 주파수 데이터를 흐르는 파형으로 시각화합니다. 잦은 음량 갱신이 React
 * 렌더링을 유발하지 않도록 feature UI의 막대 DOM을 ref로 직접 갱신합니다.
 */
export function useAudioWaveform() {
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastWaveformUpdateRef = useRef(0);
  const waveformLevelsRef = useRef([...INITIAL_INTERVIEW_WAVEFORM_LEVELS]);
  const waveformRef = useRef<HTMLDivElement>(null);

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

  const stopWaveform = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const audioContext = audioContextRef.current;

    audioContextRef.current = null;
    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close();
    }

    resetWaveform();
  };

  const startWaveform = (stream: MediaStream) => {
    stopWaveform();

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    audioContextRef.current = audioContext;
    lastWaveformUpdateRef.current = 0;

    const updateWaveform = (timestamp: number) => {
      if (timestamp - lastWaveformUpdateRef.current >= INTERVIEW_WAVEFORM_UPDATE_INTERVAL_MS) {
        analyser.getByteFrequencyData(frequencyData);

        const levels = waveformLevelsRef.current;

        levels.copyWithin(0, 1);
        levels[levels.length - 1] = createWaveformLevel(frequencyData);
        renderWaveformLevels(levels);
        lastWaveformUpdateRef.current = timestamp;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateWaveform);
    };

    animationFrameRef.current = window.requestAnimationFrame(updateWaveform);
  };

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current?.state !== 'closed') {
        void audioContextRef.current?.close();
      }
    },
    []
  );

  return { startWaveform, stopWaveform, waveformRef };
}
