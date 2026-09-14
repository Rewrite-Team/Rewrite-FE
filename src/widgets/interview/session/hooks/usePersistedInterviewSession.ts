import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  getInterviewSessionSnapshot,
  MOCK_INTERVIEW_QUESTIONS,
  saveInterviewSessionSnapshot,
} from '@/entities/interview';
import type { InterviewQuestion } from '@/entities/interview';
import { appToast } from '@/shared/lib/toast';

const subscribeToStorageSupport = () => () => undefined;
const getServerStorageSupportSnapshot = () => false;
const getStorageSupportSnapshot = () => typeof window !== 'undefined' && 'indexedDB' in window;

/**
 * ## usePersistedInterviewSession
 *
 * @description
 * 자기소개서별 면접 질문과 채팅 상태를 IndexedDB에서 복원하고, 변경된 세션을 다시 저장합니다.
 * IndexedDB를 지원하지 않는 테스트·제한 환경에서는 메모리 상태로 동작합니다.
 */
export function usePersistedInterviewSession(writingId: string) {
  const [activeQuestionId, setActiveQuestionId] = useState(MOCK_INTERVIEW_QUESTIONS[0].id);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_INTERVIEW_QUESTIONS);
  const [isRestored, setIsRestored] = useState(false);
  const hasReportedStorageErrorRef = useRef(false);
  const isStorageSupported = useSyncExternalStore(
    subscribeToStorageSupport,
    getStorageSupportSnapshot,
    getServerStorageSupportSnapshot
  );

  useEffect(() => {
    if (!isStorageSupported) {
      return;
    }

    let isCancelled = false;

    const restoreSession = async () => {
      try {
        const snapshot = await getInterviewSessionSnapshot(writingId);

        if (!isCancelled && snapshot?.version === 1 && snapshot.questions.length > 0) {
          setQuestions(snapshot.questions);
          setActiveQuestionId(snapshot.activeQuestionId);
        }
      } catch {
        if (!isCancelled) {
          appToast.error('저장된 면접 내용을 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsRestored(true);
        }
      }
    };

    void restoreSession();

    return () => {
      isCancelled = true;
    };
  }, [isStorageSupported, writingId]);

  useEffect(() => {
    if (!isRestored) {
      return;
    }

    const saveSession = async () => {
      try {
        await saveInterviewSessionSnapshot({
          activeQuestionId,
          questions,
          updatedAt: Date.now(),
          version: 1,
          writingId,
        });
      } catch {
        if (!hasReportedStorageErrorRef.current) {
          hasReportedStorageErrorRef.current = true;
          appToast.error('면접 내용을 브라우저에 저장하지 못했습니다.');
        }
      }
    };

    void saveSession();
  }, [activeQuestionId, isRestored, questions, writingId]);

  return {
    activeQuestionId,
    isReady: !isStorageSupported || isRestored,
    questions,
    setActiveQuestionId,
    setQuestions,
  };
}
