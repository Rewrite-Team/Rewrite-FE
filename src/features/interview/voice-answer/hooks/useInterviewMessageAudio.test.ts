import { act, renderHook } from '@testing-library/react';

import { getInterviewRecording } from '@/entities/interview';
import type { InterviewMessage, InterviewRecordingData } from '@/entities/interview';

import { useInterviewMessageAudio } from './useInterviewMessageAudio';

jest.mock('@/entities/interview', () => ({
  getInterviewRecording: jest.fn(),
}));

jest.mock('@/shared/lib/toast', () => ({
  appToast: {
    error: jest.fn(),
  },
}));

const createDeferred = <T>() => {
  let resolvePromise: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
};

const createMessage = (id: number): InterviewMessage => ({
  content: `녹음 답변 ${id}`,
  id,
  recordingId: `recording-${id}`,
  role: 'user',
});

const createRecording = (id: number): InterviewRecordingData => ({
  audioBlob: new Blob([String(id)], { type: 'audio/webm' }),
  createdAt: id,
  durationMs: 1_000,
  id: `recording-${id}`,
  messageId: id,
  mimeType: 'audio/webm',
  questionId: 1,
  writingId: 'writing-1',
});

describe('useInterviewMessageAudio', () => {
  it('오래된 조회가 나중에 끝나도 가장 최근에 선택한 음성만 재생한다', async () => {
    const firstRecording = createRecording(1);
    const secondRecording = createRecording(2);
    const firstRequest = createDeferred<InterviewRecordingData | undefined>();
    const secondRequest = createDeferred<InterviewRecordingData | undefined>();
    const play = jest.fn().mockResolvedValue(undefined);
    const AudioMock = jest.fn(() => ({
      addEventListener: jest.fn(),
      pause: jest.fn(),
      play,
    }));

    jest
      .mocked(getInterviewRecording)
      .mockImplementation((recordingId) =>
        recordingId === firstRecording.id ? firstRequest.promise : secondRequest.promise
      );
    Object.defineProperty(globalThis, 'Audio', {
      configurable: true,
      value: AudioMock,
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn((blob: Blob) =>
        blob === secondRecording.audioBlob ? 'blob:second' : 'blob:first'
      ),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    });

    const { result } = renderHook(() => useInterviewMessageAudio());
    let firstPlayback = Promise.resolve();
    let secondPlayback = Promise.resolve();

    act(() => {
      firstPlayback = result.current.playMessageAudio(createMessage(1));
      secondPlayback = result.current.playMessageAudio(createMessage(2));
    });
    await act(async () => {
      secondRequest.resolve(secondRecording);
      await secondPlayback;
    });
    await act(async () => {
      firstRequest.resolve(firstRecording);
      await firstPlayback;
    });

    expect(AudioMock).toHaveBeenCalledTimes(1);
    expect(AudioMock).toHaveBeenCalledWith('blob:second');
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('이전 음성의 종료 이벤트가 현재 재생 중인 음성을 정리하지 않는다', async () => {
    const firstRecording = createRecording(1);
    const secondRecording = createRecording(2);
    const endedHandlers: EventListener[] = [];
    const audioInstances: Array<{
      addEventListener: jest.Mock;
      pause: jest.Mock;
      play: jest.Mock;
    }> = [];
    const AudioMock = jest.fn(() => {
      const audio = {
        addEventListener: jest.fn((eventName: string, listener: EventListener) => {
          if (eventName === 'ended') endedHandlers.push(listener);
        }),
        pause: jest.fn(),
        play: jest.fn().mockResolvedValue(undefined),
      };

      audioInstances.push(audio);
      return audio;
    });

    jest
      .mocked(getInterviewRecording)
      .mockResolvedValueOnce(firstRecording)
      .mockResolvedValueOnce(secondRecording);
    Object.defineProperty(globalThis, 'Audio', {
      configurable: true,
      value: AudioMock,
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    });

    const { result } = renderHook(() => useInterviewMessageAudio());

    await act(async () => {
      await result.current.playMessageAudio(createMessage(1));
      await result.current.playMessageAudio(createMessage(2));
    });
    act(() => endedHandlers[0]?.(new Event('ended')));

    expect(audioInstances[1]?.pause).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:second');
  });
});
