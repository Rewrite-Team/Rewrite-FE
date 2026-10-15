import type { ReviewQuestionSnapshot } from './reviewJobEvent';

/** 문항별 최신 필드를 병합하고 서버의 문항 순서대로 반환합니다. */
export function mergeReviewQuestionSnapshots(
  previous: ReviewQuestionSnapshot[],
  incoming: ReviewQuestionSnapshot[]
): ReviewQuestionSnapshot[] {
  const questionsById = new Map(previous.map((question) => [question.questionId, question]));
  for (const question of incoming) {
    questionsById.set(question.questionId, {
      ...questionsById.get(question.questionId),
      ...question,
    });
  }
  return [...questionsById.values()].sort((first, second) => first.order - second.order);
}
