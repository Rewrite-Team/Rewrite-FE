import { useEffect, useRef } from 'react';

interface UseInterviewAutoScrollParams {
  activeMessageCount: number;
  activeQuestionId: number;
  questionCount: number;
}

const getPreferredScrollBehavior = (): ScrollBehavior =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/**
 * ## useInterviewAutoScroll
 *
 * @description
 * 활성 질문이나 메시지가 바뀌면 대화 목록을 맨 아래로 이동하고, 새 질문이 추가된 경우에만
 * 질문 목록을 맨 아래로 이동합니다. 사용자의 모션 감소 설정에 따라 스크롤 방식을 조정합니다.
 *
 * @param params 자동 스크롤 조건
 * @param params.activeMessageCount 현재 활성 질문에 포함된 메시지 수
 * @param params.activeQuestionId 현재 활성화된 질문 식별자
 * @param params.questionCount 전체 질문 수
 * @returns 각 스크롤 영역의 ref와 질문 목록 스크롤을 예약하는 함수
 */
export function useInterviewAutoScroll({
  activeMessageCount,
  activeQuestionId,
  questionCount,
}: UseInterviewAutoScrollParams) {
  const conversationRef = useRef<HTMLOListElement>(null);
  const questionListRef = useRef<HTMLOListElement>(null);
  const shouldScrollQuestionListRef = useRef(false);

  useEffect(() => {
    const conversation = conversationRef.current;

    if (!conversation) {
      return;
    }

    conversation.scrollTo({
      behavior: getPreferredScrollBehavior(),
      top: conversation.scrollHeight,
    });
  }, [activeMessageCount, activeQuestionId]);

  useEffect(() => {
    const questionList = questionListRef.current;

    if (!questionList || !shouldScrollQuestionListRef.current) {
      return;
    }

    shouldScrollQuestionListRef.current = false;
    questionList.scrollTo({
      behavior: getPreferredScrollBehavior(),
      top: questionList.scrollHeight,
    });
  }, [questionCount]);

  const requestQuestionListScroll = () => {
    shouldScrollQuestionListRef.current = true;
  };

  return {
    conversationRef,
    questionListRef,
    requestQuestionListScroll,
  };
}
