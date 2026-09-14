'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { requestPersistentInterviewStorage, saveInterviewRecording } from '@/entities/interview';
import { useInterviewRecorder } from '@/features/interview/voice-answer';
import type { CompletedInterviewRecording } from '@/features/interview/voice-answer';
import { appToast } from '@/shared/lib/toast';

import { useInterviewAutoScroll } from './hooks/useInterviewAutoScroll';
import { usePersistedInterviewSession } from './hooks/usePersistedInterviewSession';
import {
  InterviewAnswerForm,
  InterviewRecordingControls,
  InterviewTextAnswerControls,
} from './InterviewAnswerForm';
import { InterviewConversation } from './InterviewConversation';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';

interface InterviewSessionProps {
  writingId: string;
}

function getRecordingStartErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return '음성 입력을 사용하려면 마이크 권한을 허용해 주세요.';
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return '사용할 수 있는 마이크를 찾지 못했습니다.';
  }

  return '음성 입력을 시작하지 못했습니다. 다시 시도해 주세요.';
}

/**
 * ## InterviewSession
 *
 * @description
 * 자기소개서를 기반으로 생성된 질문에 채팅 형태로 답변하는 AI 면접 세션 화면입니다.
 * 답변 입력, 음성 입력 상태 표시, 질문별 대화 전환과 같은 세션 내 상호작용을 제공합니다.
 *
 * ### 접근성
 *
 * 채팅 내역은 새 메시지를 알리는 live region으로 제공하며, 아이콘 버튼에는 동작을 설명하는
 * 접근성 이름을 사용합니다. 닫힌 질문 목록은 키보드 탐색에서 제외합니다.
 *
 */
export function InterviewSession({ writingId }: InterviewSessionProps) {
  const [answer, setAnswer] = useState('');
  const [pendingRecording, setPendingRecording] = useState<CompletedInterviewRecording | null>(
    null
  );
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(true);
  const { activeQuestionId, isReady, questions, setActiveQuestionId, setQuestions } =
    usePersistedInterviewSession(writingId);
  const {
    cancelRecording,
    completeRecording,
    isSupported: isVoiceInputSupported,
    startRecording,
    status: recordingStatus,
    transcript: recordingTranscript,
    waveformRef,
  } = useInterviewRecorder();
  const isRecordingActive = recordingStatus !== 'idle';
  const activeQuestion =
    questions.find((question) => question.id === activeQuestionId) ?? questions[0];
  const activeMessageCount = activeQuestion.messages.length;
  const { conversationRef, questionListRef, requestQuestionListScroll } = useInterviewAutoScroll({
    activeMessageCount,
    activeQuestionId,
    questionCount: questions.length,
  });

  const handleQuestionPanelToggle = () => {
    setIsQuestionPanelOpen((wasOpen) => !wasOpen);
  };

  const handleRecordingStart = async () => {
    try {
      setPendingRecording(null);
      void requestPersistentInterviewStorage();
      await startRecording();
    } catch (error) {
      appToast.error(getRecordingStartErrorMessage(error));
    }
  };

  const handleRecordingCancel = () => {
    cancelRecording();
  };

  const handleRecordingComplete = async () => {
    try {
      const recording = await completeRecording();
      const recognizedAnswer = recording.transcript.trim();

      if (!recognizedAnswer) {
        appToast.error('음성을 인식하지 못했습니다. 다시 녹음해 주세요.');
        return;
      }

      setPendingRecording(recording);
      setAnswer(recognizedAnswer);
    } catch {
      appToast.error('음성 답변을 처리하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  const handleQuestionAdd = () => {
    const nextQuestionId = questions.length + 1;
    const nextQuestionPrompt = '새로운 질문을 입력해 주세요.';

    // 새 항목이 DOM에 반영된 다음 질문 목록을 아래로 이동하도록 훅에 스크롤을 예약합니다.
    requestQuestionListScroll();
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        id: nextQuestionId,
        prompt: nextQuestionPrompt,
        messages: [{ id: 1, role: 'assistant', content: nextQuestionPrompt }],
      },
    ]);
    setActiveQuestionId(nextQuestionId);
    setAnswer('');
    setPendingRecording(null);
    if (isRecordingActive) {
      cancelRecording();
    }
  };

  const handleQuestionSelect = (questionId: number) => {
    setActiveQuestionId(questionId);
    setAnswer('');
    setPendingRecording(null);
    if (isRecordingActive) {
      cancelRecording();
    }
    setIsQuestionPanelOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      return;
    }

    const questionId = activeQuestion.id;
    const nextMessageId = activeQuestion.messages.length + 1;
    let recordingId: string | undefined;

    if (pendingRecording) {
      recordingId = window.crypto.randomUUID();

      try {
        await saveInterviewRecording({
          audioBlob: pendingRecording.audioBlob,
          createdAt: Date.now(),
          durationMs: pendingRecording.durationMs,
          id: recordingId,
          messageId: nextMessageId,
          mimeType: pendingRecording.audioBlob.type,
          questionId,
          writingId,
        });
      } catch {
        appToast.error('녹음 파일을 저장하지 못했습니다. 다시 시도해 주세요.');
        return;
      }
    }

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              messages: [
                ...question.messages,
                {
                  id: nextMessageId,
                  recordingId,
                  role: 'user',
                  content: trimmedAnswer,
                },
              ],
            }
          : question
      )
    );
    setAnswer('');
    setPendingRecording(null);
  };

  return (
    <section
      aria-busy={!isReady}
      aria-label="AI 면접 대화"
      className="mt-5 w-full pb-8 sm:mt-6 sm:pb-12"
      inert={!isReady}
    >
      <div className="w-full">
        <div className="relative aspect-video min-h-80 max-h-[min(36rem,52dvh)] w-full overflow-hidden rounded-lg bg-gray-900">
          <InterviewConversation
            isQuestionPanelOpen={isQuestionPanelOpen}
            listRef={conversationRef}
            messages={activeQuestion.messages}
          />
          <InterviewQuestionPanel
            activeQuestionId={activeQuestionId}
            isOpen={isQuestionPanelOpen}
            listRef={questionListRef}
            onAdd={handleQuestionAdd}
            onSelect={handleQuestionSelect}
            onToggle={handleQuestionPanelToggle}
            questions={questions}
          />
        </div>

        <InterviewAnswerForm onSubmit={(event) => void handleSubmit(event)}>
          {isRecordingActive ? (
            <InterviewRecordingControls
              onCancel={handleRecordingCancel}
              onComplete={() => void handleRecordingComplete()}
              status={recordingStatus}
              transcript={recordingTranscript}
              waveformRef={waveformRef}
            />
          ) : (
            <InterviewTextAnswerControls
              answer={answer}
              isVoiceInputSupported={isVoiceInputSupported}
              onAnswerChange={setAnswer}
              onRecordingStart={() => void handleRecordingStart()}
            />
          )}
        </InterviewAnswerForm>
      </div>
    </section>
  );
}
