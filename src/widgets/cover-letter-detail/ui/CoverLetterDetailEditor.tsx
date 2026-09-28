'use client';

import { useRef, useState } from 'react';

import type { CoverLetterQuestionDetail } from '@/entities/cover-letter';
import { CoverLetterDetailActions } from '@/features/cover-letter/detail-actions';
import { appToast } from '@/shared/lib/toast';

import { CoverLetterQuestionCard } from './CoverLetterQuestionCard';

interface CoverLetterDetailEditorProps {
  questions: CoverLetterQuestionDetail[];
  readOnly?: boolean;
  version: string;
}

const createFinalAnswerMap = (questions: CoverLetterQuestionDetail[]) =>
  Object.fromEntries(questions.map((question) => [question.id, question.finalAnswer]));

/** 문항별 최종 작성본과 상세 화면의 저장·재첨삭 상태를 함께 관리합니다. */
export function CoverLetterDetailEditor({
  questions,
  readOnly = false,
  version,
}: CoverLetterDetailEditorProps) {
  const persistedAnswersRef = useRef(createFinalAnswerMap(questions));
  const currentAnswersRef = useRef(createFinalAnswerMap(questions));
  const [dirtyDraftQuestionIds, setDirtyDraftQuestionIds] = useState<Set<string>>(() => new Set());
  const [dirtyQuestionIds, setDirtyQuestionIds] = useState<Set<string>>(() => new Set());

  const handleFinalDraftDirtyChange = (questionId: string, isDirty: boolean) => {
    setDirtyDraftQuestionIds((previousIds) => {
      const nextIds = new Set(previousIds);

      if (isDirty) {
        nextIds.add(questionId);
      } else {
        nextIds.delete(questionId);
      }

      return nextIds;
    });
  };

  const handleFinalDraftSave = (questionId: string, value: string) => {
    currentAnswersRef.current[questionId] = value;

    setDirtyQuestionIds((previousIds) => {
      const nextIds = new Set(previousIds);

      if (value === persistedAnswersRef.current[questionId]) {
        nextIds.delete(questionId);
      } else {
        nextIds.add(questionId);
      }

      return nextIds;
    });
  };

  const handleDetailSave = () => {
    persistedAnswersRef.current = { ...currentAnswersRef.current };
    setDirtyQuestionIds(new Set());
  };

  const handleRereview = () => {
    appToast.info('현재 AI 재첨삭을 요청할 수 없습니다.');

    return false;
  };

  return (
    <>
      <div className="flex flex-col gap-15">
        {questions.map((question, index) => (
          <CoverLetterQuestionCard
            key={question.id}
            onFinalDraftDirtyChange={handleFinalDraftDirtyChange}
            onFinalDraftSave={handleFinalDraftSave}
            question={question}
            questionNumber={index + 1}
            readOnly={readOnly}
          />
        ))}
      </div>

      {readOnly ? null : (
        <CoverLetterDetailActions
          hasUnsavedChanges={dirtyQuestionIds.size > 0 || dirtyDraftQuestionIds.size > 0}
          onRereview={handleRereview}
          onSave={handleDetailSave}
          version={version}
        />
      )}
    </>
  );
}
