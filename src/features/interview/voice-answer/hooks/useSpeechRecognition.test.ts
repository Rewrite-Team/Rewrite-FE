import { act, renderHook } from '@testing-library/react';

import { useSpeechRecognition } from './useSpeechRecognition';

interface MockRecognitionErrorEvent extends Event {
  error: string;
}

describe('useSpeechRecognition', () => {
  it('브라우저가 인식을 종료하면 녹음 중에는 자동으로 다시 시작한다', () => {
    const recognition = {
      abort: jest.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onend: null as (() => void) | null,
      onerror: null as ((event: MockRecognitionErrorEvent) => void) | null,
      onresult: null,
      start: jest.fn(),
      stop: jest.fn(),
    };
    const SpeechRecognitionMock = jest.fn(() => recognition);

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: SpeechRecognitionMock,
    });

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => result.current.startRecognition());
    act(() => recognition.onend?.());

    expect(recognition.start).toHaveBeenCalledTimes(2);
  });

  it('복구할 수 없는 오류가 발생하면 자동 재시작을 중단한다', () => {
    const recognition = {
      abort: jest.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onend: null as (() => void) | null,
      onerror: null as ((event: MockRecognitionErrorEvent) => void) | null,
      onresult: null,
      start: jest.fn(),
      stop: jest.fn(),
    };
    const SpeechRecognitionMock = jest.fn(() => recognition);

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: SpeechRecognitionMock,
    });

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => result.current.startRecognition());
    act(() => {
      recognition.onerror?.({ error: 'network' } as MockRecognitionErrorEvent);
      recognition.onend?.();
    });

    expect(recognition.start).toHaveBeenCalledTimes(1);
  });
});
