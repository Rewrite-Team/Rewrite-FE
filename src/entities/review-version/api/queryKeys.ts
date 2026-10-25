export const reviewVersionQueryKeys = {
  list: (coverLetterId: string) => ['review-versions', coverLetterId, 'list'] as const,
  detail: (coverLetterId: string, versionId: string) =>
    ['review-versions', coverLetterId, 'detail', versionId] as const,
};
