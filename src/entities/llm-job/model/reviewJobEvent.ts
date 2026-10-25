import { z } from 'zod';

import { LlmJobStatus } from '../api/types';

const jobStateSchema = z.object({
  jobType: z.enum(['COVER_LETTER_REVIEW', 'COVER_LETTER_RE_REVIEW']).optional(),
  status: z.enum(LlmJobStatus),
  progress: z.object({
    current: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    message: z.string(),
  }),
  resultRef: z.object({ type: z.string(), id: z.string() }).nullable(),
  error: z.object({ code: z.string(), message: z.string() }).nullable(),
});

const reviewQuestionsSchema = z.object({
  items: z.array(
    z.object({
      questionId: z.string(),
      order: z.number().int(),
      aiReport: z.string().nullable().optional(),
      rewrittenAnswer: z.string().nullable().optional(),
      finalAnswer: z.string().nullable().optional(),
    })
  ),
});

/** 최초 첨삭·재첨삭 Job에서 사용하는 상태 및 문항 중간 결과만 검증합니다. */
export function parseCoverLetterReviewEvent(event: string, data: string) {
  if (event === 'job.state')
    return { event, data: jobStateSchema.parse(JSON.parse(data)) } as const;
  if (event === 'review.questions')
    return { event, data: reviewQuestionsSchema.parse(JSON.parse(data)) } as const;
  return undefined;
}

export type ReviewQuestionSnapshot = z.infer<typeof reviewQuestionsSchema>['items'][number];
