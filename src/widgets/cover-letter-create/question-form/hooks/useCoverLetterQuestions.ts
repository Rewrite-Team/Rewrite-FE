'use client';

import { useEffect, useRef, useState } from 'react';

import {
  useFieldArray,
  type Control,
  type UseFormGetValues,
  type UseFormSetFocus,
} from 'react-hook-form';

import type {
  CoverLetterStep3FormInput,
  CoverLetterStep3Values,
} from '@/features/cover-letter/create-flow';

import { EMPTY_QUESTION } from '../constants';

interface CoverLetterQuestionsOptions {
  control: Control<CoverLetterStep3FormInput, unknown, CoverLetterStep3Values>;
  getValues: UseFormGetValues<CoverLetterStep3FormInput>;
  setFocus: UseFormSetFocus<CoverLetterStep3FormInput>;
  isSaving: boolean;
}

/**
 * ## useCoverLetterQuestions
 *
 * @description
 * 문항 추가·삭제, 삭제 확인, 펼침 상태와 포커스 이동을 관리합니다.
 * 모달 닫기나 문항 펼침 이후의 포커스는 다음 프레임에 옮기며,
 * 새 포커스 예약과 화면 이탈 시 이전 예약을 취소합니다.
 */
export function useCoverLetterQuestions({
  control,
  getValues,
  setFocus,
  isSaving,
}: CoverLetterQuestionsOptions) {
  const { append, fields, remove } = useFieldArray({ control, name: 'questions' });
  const questionTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusFrameRef = useRef<number | null>(null);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  useEffect(
    () => () => {
      if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    },
    []
  );

  const scheduleFocus = (focus: () => void) => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    const frame = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      focus();
    });
    focusFrameRef.current = frame;
    return () => {
      cancelAnimationFrame(frame);
      if (focusFrameRef.current === frame) focusFrameRef.current = null;
    };
  };

  const registerQuestionTrigger = (index: number, element: HTMLButtonElement | null) => {
    questionTriggerRefs.current[index] = element;
  };

  const openQuestion = (index: number) => setOpenQuestionIndex(index);

  const focusQuestionField = (
    index: number,
    field: Parameters<UseFormSetFocus<CoverLetterStep3FormInput>>[0]
  ) => {
    if (index >= getValues('questions').length) return;
    openQuestion(index);
    // 문항의 inert가 해제된 다음 프레임에 입력란으로 포커스를 옮깁니다.
    return scheduleFocus(() => setFocus(field));
  };

  const handleOpenChange = (index: number) => (open: boolean) => {
    setOpenQuestionIndex(open ? index : null);
  };

  const handleAddQuestion = () => {
    append({ ...EMPTY_QUESTION });
    openQuestion(fields.length);
  };

  const deleteQuestion = (index: number) => {
    if (fields.length <= 1 || isSaving) return;
    const focusTarget =
      questionTriggerRefs.current[index + 1] ?? questionTriggerRefs.current[index - 1];

    remove(index);
    setOpenQuestionIndex((currentIndex) => {
      if (currentIndex === null || currentIndex < index) return currentIndex;
      if (currentIndex > index) return currentIndex - 1;
      return Math.min(index, fields.length - 2);
    });
    if (pendingDeleteIndex === null) {
      focusTarget?.focus();
    } else {
      scheduleFocus(() => focusTarget?.focus());
    }
  };

  const handleDeleteQuestion = (index: number) => () => {
    if (fields.length <= 1 || isSaving) return;
    const hasContent = Object.values(getValues(`questions.${index}`)).some(
      (value) => value.trim().length > 0
    );
    if (hasContent) {
      setPendingDeleteIndex(index);
      return;
    }
    deleteQuestion(index);
  };

  const handleDeleteModalOpenChange = (open: boolean) => {
    if (open || pendingDeleteIndex === null) return;
    const focusTarget = questionTriggerRefs.current[pendingDeleteIndex];
    setPendingDeleteIndex(null);
    scheduleFocus(() => focusTarget?.focus());
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteIndex === null) return;
    deleteQuestion(pendingDeleteIndex);
    setPendingDeleteIndex(null);
  };

  return {
    fields,
    openQuestionIndex,
    pendingDeleteIndex,
    registerQuestionTrigger,
    openQuestion,
    focusQuestionField,
    handleOpenChange,
    handleAddQuestion,
    handleDeleteQuestion,
    handleDeleteModalOpenChange,
    handleConfirmDelete,
  };
}
