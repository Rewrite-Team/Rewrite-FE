export const getSaveDraftMutationKey = (coverLetterId: string) =>
  ['cover-letter-create', coverLetterId, 'save'] as const;
