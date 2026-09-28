import type { Api007Params } from './types';

export const coverLetterQueryKeys = {
  all: ['cover-letters'] as const,
  lists: () => [...coverLetterQueryKeys.all, 'list'] as const,
  list: (params?: Api007Params) => [...coverLetterQueryKeys.lists(), params] as const,
  details: () => [...coverLetterQueryKeys.all, 'detail'] as const,
  detail: (coverLetterId: string) => [...coverLetterQueryKeys.details(), coverLetterId] as const,
};
