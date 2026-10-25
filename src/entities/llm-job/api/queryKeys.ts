export const llmJobQueryKeys = {
  status: (jobId: string) => ['llm-jobs', jobId] as const,
};
