'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { MOCK_INTERVIEW_QUESTIONS } from '@/shared/mocks';

import { useInterviewAutoScroll } from './hooks/useInterviewAutoScroll';
import {
  InterviewAnswerForm,
  InterviewRecordingControls,
  InterviewTextAnswerControls,
} from './InterviewAnswerForm';
import { InterviewConversation } from './InterviewConversation';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';

import type { InterviewQuestion } from './types';

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
export function InterviewSession() {
  const [answer, setAnswer] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState(MOCK_INTERVIEW_QUESTIONS[0].id);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_INTERVIEW_QUESTIONS);
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

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingCancel = () => {
    setIsRecording(false);
  };

  const handleRecordingComplete = () => {
    setIsRecording(false);
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
    setIsRecording(false);
  };

  const handleQuestionSelect = (questionId: number) => {
    setActiveQuestionId(questionId);
    setAnswer('');
    setIsRecording(false);
    setIsQuestionPanelOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === activeQuestionId
          ? {
              ...question,
              messages: [
                ...question.messages,
                {
                  id: question.messages.length + 1,
                  role: 'user',
                  content: trimmedAnswer,
                },
              ],
            }
          : question
      )
    );
    setAnswer('');
    setIsRecording(false);
  };

  return (
    <section aria-label="AI 면접 대화" className="mt-5 w-full pb-8 sm:mt-6 sm:pb-12">
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

        <InterviewAnswerForm onSubmit={handleSubmit}>
          {isRecording ? (
            <InterviewRecordingControls
              onCancel={handleRecordingCancel}
              onComplete={handleRecordingComplete}
            />
          ) : (
            <InterviewTextAnswerControls
              answer={answer}
              onAnswerChange={setAnswer}
              onRecordingStart={handleRecordingStart}
            />
          )}
        </InterviewAnswerForm>
      </div>
    </section>
  );
}
