import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface BrowserSpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

const subscribeToVoiceSupport = () => () => undefined;
const getServerVoiceSupportSnapshot = () => false;

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const speechWindow = window as SpeechRecognitionWindow;

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function getVoiceSupportSnapshot() {
  return Boolean(getSpeechRecognitionConstructor());
}

/**
 * ## useSpeechRecognition
 *
 * @description
 * 브라우저 음성 인식을 한국어 연속 입력으로 실행하고 종료 시 최종 텍스트를 반환합니다.
 * 인식 서비스가 녹음 도중 종료되면 현재 입력을 유지한 채 자동으로 다시 시작합니다.
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const shouldContinueRef = useRef(false);
  const stopResolverRef = useRef<((transcript: string) => void) | null>(null);
  const isSupported = useSyncExternalStore(
    subscribeToVoiceSupport,
    getVoiceSupportSnapshot,
    getServerVoiceSupportSnapshot
  );

  const resolveTranscript = () => {
    const resolvedTranscript =
      `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();

    stopResolverRef.current?.(resolvedTranscript);
    stopResolverRef.current = null;
    return resolvedTranscript;
  };

  const startRecognition = () => {
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      throw new Error('SPEECH_RECOGNITION_UNSUPPORTED');
    }

    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setTranscript('');
    shouldContinueRef.current = true;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';
    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const recognizedText = result[0]?.transcript ?? '';

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${recognizedText}`.trim();
        } else {
          interimTranscript += recognizedText;
        }
      }

      interimTranscriptRef.current = interimTranscript;
      setTranscript(`${finalTranscriptRef.current} ${interimTranscript}`.trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        shouldContinueRef.current = false;
        resolveTranscript();
      }
    };
    recognition.onend = () => {
      if (shouldContinueRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          shouldContinueRef.current = false;
        }
      }

      recognitionRef.current = null;
      resolveTranscript();
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
    shouldContinueRef.current = false;

    return new Promise<string>((resolve) => {
      const recognition = recognitionRef.current;

      if (!recognition) {
        resolve(resolveTranscript());
        return;
      }

      stopResolverRef.current = resolve;
      try {
        recognition.stop();
      } catch {
        recognitionRef.current = null;
        resolveTranscript();
      }

      window.setTimeout(() => {
        if (stopResolverRef.current) {
          resolveTranscript();
        }
      }, 1_000);
    });
  };

  const abortRecognition = () => {
    shouldContinueRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    resolveTranscript();
    setTranscript('');
  };

  useEffect(
    () => () => {
      shouldContinueRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      stopResolverRef.current?.(
        `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim()
      );
      stopResolverRef.current = null;
    },
    []
  );

  return {
    abortRecognition,
    isSupported,
    startRecognition,
    stopRecognition,
    transcript,
  };
}
