'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';
import type { AnswerRequest } from '@/entities/review-version';
import {
  CoverLetterDetailActions,
  useRequestReReview,
  useSaveFinalAnswers,
} from '@/features/cover-letter/detail-actions';
import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';
import { BadgeGroup } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';

import { CoverLetterReviewQuestion } from './CoverLetterReviewQuestion';

interface CoverLetterReviewResultProps {
  detail: CoverLetterDetailResponse;
  showCompletionNotice?: boolean;
}

/** 선택한 첨삭 버전의 기본 정보와 완료된 문항을 표시합니다. */
export function CoverLetterReviewResult({
  detail,
  showCompletionNotice = false,
}: CoverLetterReviewResultProps) {
  const router = useRouter();
  const [answerOverrides, setAnswerOverrides] = useState<Record<string, string>>({});
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const versionId = detail.reviewVersion?.id ?? '';
  const isEditable = detail.reviewVersion?.isLatestReviewed ?? false;
  const hasPendingChanges =
    Object.keys(answerOverrides).length > 0 || Object.keys(draftAnswers).length > 0;
  const saveFinalAnswersMutation = useSaveFinalAnswers(detail.coverLetter.id, versionId);
  const requestReReviewMutation = useRequestReReview(detail.coverLetter.id);

  const handleAnswerCommit = (questionId: string, nextAnswer: string) => {
    const originalAnswer = detail.questions.find((question) => question.questionId === questionId);
    const persistedAnswer = originalAnswer?.finalAnswer ?? originalAnswer?.rewrittenAnswer ?? '';

    setAnswerOverrides((currentOverrides) => {
      const nextOverrides = { ...currentOverrides };
      if (nextAnswer === persistedAnswer) {
        delete nextOverrides[questionId];
      } else {
        nextOverrides[questionId] = nextAnswer;
      }
      return nextOverrides;
    });
  };

  const handleDraftChange = (questionId: string, draftAnswer: string | null) => {
    setDraftAnswers((currentDrafts) => {
      if (draftAnswer === null) {
        if (!(questionId in currentDrafts)) return currentDrafts;
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[questionId];
        return nextDrafts;
      }
      if (currentDrafts[questionId] === draftAnswer) return currentDrafts;
      return { ...currentDrafts, [questionId]: draftAnswer };
    });
  };

  const getAnswers = () => {
    const answers: AnswerRequest[] = [];
    for (const question of detail.questions) {
      if (!question.questionResultId) {
        appToast.error('저장할 문항 결과를 찾을 수 없습니다. 다시 불러와 주세요.');
        return undefined;
      }
      const finalAnswer =
        draftAnswers[question.questionId] ??
        answerOverrides[question.questionId] ??
        question.finalAnswer ??
        question.rewrittenAnswer ??
        '';
      if (!finalAnswer.trim()) {
        appToast.error('최종 작성본을 입력한 뒤 저장해 주세요.');
        return undefined;
      }
      answers.push({
        questionResultId: question.questionResultId,
        finalAnswer,
      });
    }
    return answers;
  };

  const persistAnswers = async () => {
    if (!isEditable || !detail.reviewVersion) return false;
    const answers = getAnswers();
    if (!answers) return false;

    try {
      await saveFinalAnswersMutation.mutateAsync({ answers });
      setAnswerOverrides({});
      setDraftAnswers({});
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const isSaved = await persistAnswers();
    if (isSaved) router.replace(ROUTES.WRITING_DETAIL(detail.coverLetter.id));
    return isSaved;
  };

  const handleRereview = async (requirement: string) => {
    try {
      if (hasPendingChanges && !(await persistAnswers())) return false;
      const { jobId } = await requestReReviewMutation.mutateAsync(requirement);
      setAnswerOverrides({});
      setDraftAnswers({});
      router.replace(
        `${ROUTES.WRITING_DETAIL(detail.coverLetter.id)}?jobId=${encodeURIComponent(jobId)}`
      );
      return true;
    } catch {
      return false;
    }
  };

  return (
    <section className="writing-detail-content">
      <PageHeader
        className="mb-10"
        title={detail.coverLetter.title ?? '자기소개서'}
        version={detail.reviewVersion?.version}
        eyebrow={
          <BadgeGroup
            companyName={detail.coverLetter.companyName ?? ''}
            jobName={detail.coverLetter.positionTitle ?? ''}
          />
        }
      />
      {showCompletionNotice && detail.reviewVersion?.isLatestReviewed ? (
        <div
          className="mt-6 flex flex-col gap-3 rounded-3xl border border-primary-500/30 bg-primary-500/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          role="status"
        >
          <div>
            <p className="m-0 body-16 font-semibold text-white">AI 첨삭이 완료됐어요</p>
            <p className="mt-1 mb-0 body-14 text-gray-100">
              문항별 첨삭 결과와 최종 작성본을 확인해 보세요.
            </p>
          </div>
          <span className="w-fit rounded-full bg-primary-500/15 px-3 py-1 body-12 font-semibold text-primary-200">
            완료
          </span>
        </div>
      ) : null}
      <div className="flex flex-col gap-15">
        {[...detail.questions]
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <CoverLetterReviewQuestion
              key={question.questionId}
              finalAnswer={
                (isEditable ? draftAnswers[question.questionId] : undefined) ??
                (isEditable ? answerOverrides[question.questionId] : undefined) ??
                question.finalAnswer ??
                question.rewrittenAnswer ??
                ''
              }
              isEditable={isEditable}
              onAnswerCommit={handleAnswerCommit}
              onDraftChange={handleDraftChange}
              question={question}
              questionNumber={index + 1}
            />
          ))}
      </div>
      {isEditable && detail.reviewVersion ? (
        <CoverLetterDetailActions
          canSave={hasPendingChanges}
          hasUnsavedChanges={hasPendingChanges}
          isRereviewing={requestReReviewMutation.isPending}
          isSaving={saveFinalAnswersMutation.isPending}
          onRereview={handleRereview}
          onSave={handleSave}
          version={detail.reviewVersion.version}
        />
      ) : null}
    </section>
  );
}
